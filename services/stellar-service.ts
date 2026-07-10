import { Horizon } from '@stellar/stellar-sdk';
import type { FeeBumpTransaction, Transaction } from '@stellar/stellar-sdk';
import { ConfigService } from '@/services/config-service';
import { StellarNetwork } from '@/lib/stellar-explorer';

export type StellarErrorKind =
  | 'NOT_FOUND'
  | 'FRIENDBOT_UNAVAILABLE'
  | 'FRIENDBOT_FAILED'
  | 'SUBMIT_FAILED'
  | 'TIMEOUT'
  | 'CONFIG'
  | 'UNKNOWN';

export class StellarServiceError extends Error {
  readonly kind: StellarErrorKind;
  readonly resultCodes?: unknown;

  constructor(message: string, kind: StellarErrorKind, resultCodes?: unknown) {
    super(message);
    this.name = 'StellarServiceError';
    this.kind = kind;
    this.resultCodes = resultCodes;
  }
}

export type StellarBalanceLine = {
  assetType: string;
  assetCode: string | null;
  assetIssuer: string | null;
  balance: string;
};

export type StellarAccountSummary = {
  publicKey: string;
  exists: boolean;
  nativeBalance: string;
  balances: StellarBalanceLine[];
  sequence: string | null;
};

export type StellarSubmitResult = {
  hash: string;
  ledger: number | null;
  successful: boolean;
};

const FUND_POLL_ATTEMPTS = 15;
const FUND_POLL_INTERVAL_MS = 2000;
const TX_POLL_ATTEMPTS = 15;
const TX_POLL_INTERVAL_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isHorizonNotFound(error: unknown) {
  const candidate = error as { name?: string; response?: { status?: number } } | null;
  return candidate?.name === 'NotFoundError' || candidate?.response?.status === 404;
}

function extractResultCodes(error: unknown) {
  const candidate = error as { response?: { data?: { extras?: { result_codes?: unknown } } } } | null;
  return candidate?.response?.data?.extras?.result_codes ?? null;
}

/**
 * Thin, verified wrapper over the Stellar Horizon REST API used by Betless.
 * Every method performs a real network call; there is no mocked behaviour.
 */
export class StellarService {
  private static server() {
    return new Horizon.Server(ConfigService.getStellarHorizonUrl());
  }

  /**
   * Loads an account from Horizon. Returns null when the account does not yet
   * exist on-ledger (Horizon 404), which is how Stellar signals an unfunded
   * account. Any other transport error is rethrown.
   */
  static async getAccount(publicKey: string): Promise<StellarAccountSummary | null> {
    try {
      const account = await this.server().loadAccount(publicKey);
      const balances: StellarBalanceLine[] = account.balances.map((line: any) => ({
        assetType: line.asset_type,
        assetCode: line.asset_code ?? (line.asset_type === 'native' ? 'XLM' : null),
        assetIssuer: line.asset_issuer ?? null,
        balance: line.balance ?? '0',
      }));
      const native = balances.find((line) => line.assetType === 'native');

      return {
        publicKey,
        exists: true,
        nativeBalance: native?.balance ?? '0',
        balances,
        sequence: account.sequenceNumber(),
      };
    } catch (error) {
      if (isHorizonNotFound(error)) {
        return null;
      }
      throw new StellarServiceError(
        'Could not reach the Stellar network to load the account. Try again shortly.',
        'UNKNOWN',
      );
    }
  }

  static async accountExists(publicKey: string) {
    const account = await this.getAccount(publicKey);
    return Boolean(account?.exists);
  }

  /**
   * Lightweight reachability check against Horizon for the configured network.
   */
  static async ping(): Promise<boolean> {
    try {
      await this.server().fetchBaseFee();
      return true;
    } catch {
      return false;
    }
  }

  static async getNativeBalance(publicKey: string): Promise<string | null> {
    const account = await this.getAccount(publicKey);
    return account ? account.nativeBalance : null;
  }

  /**
   * Funds a testnet account using Friendbot, then polls Horizon until the
   * account is visible on-ledger so callers can rely on the account existing.
   * Friendbot is only available on testnet/futurenet; on mainnet this throws.
   */
  static async fundWithFriendbot(publicKey: string): Promise<StellarAccountSummary> {
    if (ConfigService.getStellarNetwork() === StellarNetwork.PUBLIC) {
      throw new StellarServiceError(
        'Automatic funding is only available on Stellar Testnet. Fund this account manually on mainnet.',
        'FRIENDBOT_UNAVAILABLE',
      );
    }

    const friendbotUrl = ConfigService.getStellarFriendbotUrl();
    if (!friendbotUrl) {
      throw new StellarServiceError('Friendbot is not configured for this network.', 'FRIENDBOT_UNAVAILABLE');
    }

    const existing = await this.getAccount(publicKey);
    if (existing) {
      return existing;
    }

    const requestUrl = `${friendbotUrl}?addr=${encodeURIComponent(publicKey)}`;

    let response: Response;
    try {
      response = await fetch(requestUrl, { method: 'GET' });
    } catch {
      throw new StellarServiceError('Could not reach Friendbot to fund the account. Try again shortly.', 'FRIENDBOT_FAILED');
    }

    if (!response.ok) {
      // Friendbot returns 400 when the account already exists; tolerate that
      // and fall through to the confirmation poll below.
      const alreadyFunded = await this.getAccount(publicKey);
      if (!alreadyFunded && response.status !== 400) {
        throw new StellarServiceError(`Friendbot funding failed (status ${response.status}).`, 'FRIENDBOT_FAILED');
      }
    }

    for (let attempt = 0; attempt < FUND_POLL_ATTEMPTS; attempt += 1) {
      const account = await this.getAccount(publicKey);
      if (account) {
        return account;
      }
      await sleep(FUND_POLL_INTERVAL_MS);
    }

    throw new StellarServiceError(
      'Funding was requested but the account has not appeared on the network yet. Try again in a moment.',
      'TIMEOUT',
    );
  }

  /**
   * Ensures an account exists on-ledger. On testnet it will fund via Friendbot;
   * on mainnet it only reports existence.
   */
  static async ensureAccountFunded(publicKey: string): Promise<StellarAccountSummary> {
    const account = await this.getAccount(publicKey);
    if (account) {
      return account;
    }
    return this.fundWithFriendbot(publicKey);
  }

  private static async pollTransaction(hash: string): Promise<StellarSubmitResult | null> {
    const server = this.server();

    for (let attempt = 0; attempt < TX_POLL_ATTEMPTS; attempt += 1) {
      try {
        const record = (await server.transactions().transaction(hash).call()) as {
          ledger_attr?: number;
          successful?: boolean;
        };
        return {
          hash,
          ledger: typeof record.ledger_attr === 'number' ? record.ledger_attr : null,
          successful: record.successful === true,
        };
      } catch (error) {
        if (!isHorizonNotFound(error)) {
          throw error;
        }
      }
      await sleep(TX_POLL_INTERVAL_MS);
    }

    return null;
  }

  /**
   * Submits a signed transaction and confirms it landed in a ledger.
   * Uses the synchronous submit endpoint and, on a Horizon 504 timeout,
   * polls GET /transactions/:hash as recommended by the Horizon docs.
   */
  static async submitAndConfirm(transaction: Transaction | FeeBumpTransaction): Promise<StellarSubmitResult> {
    const server = this.server();
    const expectedHash = transaction.hash().toString('hex');

    try {
      const response = (await server.submitTransaction(transaction)) as {
        hash?: string;
        ledger?: number;
        successful?: boolean;
      };

      const hash = response.hash ?? expectedHash;

      if (response.successful === false) {
        throw new StellarServiceError('The Stellar transaction was rejected by the network.', 'SUBMIT_FAILED');
      }

      return {
        hash,
        ledger: typeof response.ledger === 'number' ? response.ledger : null,
        successful: response.successful ?? true,
      };
    } catch (error) {
      if (error instanceof StellarServiceError) {
        throw error;
      }

      const status = (error as { response?: { status?: number } })?.response?.status;

      // 504: Horizon timed out waiting for ingestion. Poll for the result.
      if (status === 504) {
        const confirmed = await this.pollTransaction(expectedHash);
        if (confirmed?.successful) {
          return confirmed;
        }
        throw new StellarServiceError(
          'The Stellar network is busy and the transaction was not confirmed in time. Try again.',
          'TIMEOUT',
        );
      }

      const resultCodes = extractResultCodes(error);
      if (resultCodes) {
        throw new StellarServiceError('The Stellar transaction failed.', 'SUBMIT_FAILED', resultCodes);
      }

      throw new StellarServiceError('Could not submit the transaction to the Stellar network.', 'UNKNOWN');
    }
  }

  /**
   * Returns the id of the first operation for a confirmed transaction, used to
   * build operation-level explorer links. Returns null if unavailable.
   */
  static async getFirstOperationId(transactionHash: string): Promise<string | null> {
    try {
      const operations = await this.server().operations().forTransaction(transactionHash).call();
      return operations.records?.[0]?.id ?? null;
    } catch {
      return null;
    }
  }
}
