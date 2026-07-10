import { prisma } from '@/lib/prisma';
import { getConfiguredStellarNetwork, getStellarNetworkLabel, getStellarNetworkPassphrase, StellarNetwork } from '@/lib/stellar-explorer';

export class ConfigService {
  static getRewardRate() {
    return 0.01;
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

  static async getConfigValue(key: string, fallback: string) {
    const config = await prisma.appConfig.findUnique({ where: { key } });
    return config?.value ?? fallback;
  }
}
