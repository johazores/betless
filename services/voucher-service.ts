export class VoucherService {
  static generateMockVoucherCode(rewardName: string) {
    const prefix = rewardName
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .replace(/[^A-Z]/gi, '')
      .slice(0, 4)
      .toUpperCase()
      .padEnd(3, 'B');

    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `BTL-${prefix}-${randomPart}`;
  }

  static createVoucher(rewardName: string, value: number) {
    return {
      code: this.generateMockVoucherCode(rewardName),
      name: rewardName,
      value,
      demoOnlyMessage: 'Demo-only voucher. No real voucher supplier or redemption value is connected in this MVP.',
    };
  }
}
