import { cn } from '@/lib/class-names';
import { paymentMethodMarks } from '@/components/payment/payment-method-marks';
import type { PaymentMethod } from '@/lib/payment-methods';

type PaymentMethodIconProps = {
  method: PaymentMethod;
  size?: 'sm' | 'md';
  className?: string;
};

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-11 w-11',
};

export function PaymentMethodIcon({ method, size = 'sm', className }: PaymentMethodIconProps) {
  const Mark = paymentMethodMarks[method.id];

  if (Mark) {
    return <Mark className={cn('shrink-0', sizes[size], className)} />;
  }

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-lg font-black text-white',
        sizes[size],
        method.markClassName,
        className,
      )}
      aria-hidden
    >
      {method.mark}
    </span>
  );
}
