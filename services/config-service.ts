import { prisma } from '@/lib/prisma';

export class ConfigService {
  static getRewardRate() {
    return 0.01;
  }

  static getStellarHorizonUrl() {
    return process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
  }

  static async getConfigValue(key: string, fallback: string) {
    const config = await prisma.appConfig.findUnique({ where: { key } });
    return config?.value ?? fallback;
  }
}
