import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  BASE_FEE,
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

const horizonUrl = process.env.STELLAR_HORIZON_URL?.trim() || 'https://horizon-testnet.stellar.org';
const outputPath = resolve(process.env.INSTAWARDS_RECEIPT_OUTPUT ?? 'artifacts/early-exit-multisig.json');

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}.`);
  return value;
}

function signerWeight(account, publicKey) {
  return account.signers.find((signer) => signer.key === publicKey)?.weight ?? 0;
}

async function submit(server, sourcePublicKey, signer, operations) {
  const source = await server.loadAccount(sourcePublicKey);
  let builder = new TransactionBuilder(source, {
    fee: String(Number(BASE_FEE) * 10),
    networkPassphrase: Networks.TESTNET,
  });
  for (const operation of operations) builder = builder.addOperation(operation);
  const transaction = builder.setTimeout(60).build();
  transaction.sign(signer);
  const result = await server.submitTransaction(transaction);
  return result.hash;
}

async function main() {
  const network = (process.env.STELLAR_NETWORK ?? 'testnet').trim().toLowerCase();
  if (network !== 'testnet') {
    throw new Error('This configuration script is restricted to Stellar testnet.');
  }

  const ops = Keypair.fromSecret(required('STELLAR_OPS_SECRET'));
  const approverB = Keypair.fromPublicKey(required('STELLAR_APPROVER_B_PUBLIC_KEY')).publicKey();
  const approverC = Keypair.fromPublicKey(required('STELLAR_APPROVER_C_PUBLIC_KEY')).publicKey();
  const signerKeys = new Set([ops.publicKey(), approverB, approverC]);
  if (signerKeys.size !== 3) throw new Error('The three approver public keys must be different.');

  const server = new Horizon.Server(horizonUrl);
  const before = await server.loadAccount(ops.publicKey());
  const alreadyConfigured =
    signerWeight(before, ops.publicKey()) === 1 &&
    signerWeight(before, approverB) === 1 &&
    signerWeight(before, approverC) === 1 &&
    before.thresholds.low_threshold === 2 &&
    before.thresholds.med_threshold === 2 &&
    before.thresholds.high_threshold === 2;

  const transactionHashes = [];
  if (!alreadyConfigured) {
    if (before.thresholds.high_threshold > 1) {
      throw new Error(
        'The account already requires multiple signatures for signer changes. Use the separated approval process instead of rerunning this bootstrap script.',
      );
    }

    const signerHash = await submit(server, ops.publicKey(), ops, [
      Operation.setOptions({ signer: { ed25519PublicKey: approverB, weight: 1 } }),
      Operation.setOptions({ signer: { ed25519PublicKey: approverC, weight: 1 } }),
    ]);
    transactionHashes.push(signerHash);

    const thresholdHash = await submit(server, ops.publicKey(), ops, [
      Operation.setOptions({
        masterWeight: 1,
        lowThreshold: 2,
        medThreshold: 2,
        highThreshold: 2,
      }),
    ]);
    transactionHashes.push(thresholdHash);
  }

  const after = await server.loadAccount(ops.publicKey());
  const verified =
    signerWeight(after, ops.publicKey()) === 1 &&
    signerWeight(after, approverB) === 1 &&
    signerWeight(after, approverC) === 1 &&
    after.thresholds.low_threshold === 2 &&
    after.thresholds.med_threshold === 2 &&
    after.thresholds.high_threshold === 2;

  if (!verified) throw new Error('The final signer or threshold policy does not match 2-of-3.');

  const explorerBase = 'https://stellar.expert/explorer/testnet';
  const manifest = {
    project: 'Betless',
    network: 'Stellar testnet',
    accountId: ops.publicKey(),
    accountUrl: `${explorerBase}/account/${ops.publicKey()}`,
    generatedAt: new Date().toISOString(),
    policy: {
      signers: [ops.publicKey(), approverB, approverC],
      weights: [1, 1, 1],
      lowThreshold: 2,
      mediumThreshold: 2,
      highThreshold: 2,
      explanation:
        'claimClaimableBalance uses the low threshold, payment uses the medium threshold, and signer-policy changes use the high threshold.',
    },
    configurationTransactions: transactionHashes.map((hash) => ({
      hash,
      explorerUrl: `${explorerBase}/tx/${hash}`,
    })),
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error('Multisignature configuration failed:', error);
  process.exitCode = 1;
});
