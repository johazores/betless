import { prisma } from '@/lib/prisma';
import { getConfiguredStellarNetwork, getStellarNetworkLabel, getStellarNetworkPassphrase, StellarNetwork } from '@/lib/stellar-explorer';

const DEFAULT_REWARD_RATE = 0.01;

export class ConfigService {
  static async getRewardRate() {
    const raw = await this.getConfigValue('reward_rate', process.env.REWARD_RATE ?? String(DEFAULT_REWARD_RATE));
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_REWARD_RATE;
  }

  static getStellarNetwork() {
    return getConfiguredStellarNetwork();
  }

  static getStellarNetworkLabel() {
    return getStellarNetworkLabel(this.getStellarNetwork());
  }

  static getStellarNetworkPassphrase() {
    return getStellarNetworkPassphrase(this.getStellarNetwork());
  }

  static getStellarHorizonUrl() {
    if (process.env.STELLAR_HORIZON_URL) return process.env.STELLAR_HORIZON_URL;
    return this.getStellarNetwork() === StellarNetwork.PUBLIC
      ? 'https://horizon.stellar.org'
      : 'https://horizon-testnet.stellar.org';
  }

  static getStellarFriendbotUrl(): string | null {
    if (process.env.STELLAR_FRIENDBOT_URL) return process.env.STELLAR_FRIENDBOT_URL;
    // Friendbot only exists on non-production networks.
    return this.getStellarNetwork() === StellarNetwork.PUBLIC ? null : 'https://friendbot.stellar.org';
  }

  static async getConfigValue(key: string, fallback: string) {
    const config = await prisma.appConfig.findUnique({ where: { key } });
    return config?.value ?? fallback;
  }
}
