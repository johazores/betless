import { cn } from '@/lib/class-names';
import { paymentMethodMarks } from '@/components/payment/payment-method-marks';
import type { PaymentMethod } from '@/lib/payment-methods';

type PaymentMethodIconProps = {
  method: PaymentMethod;
  size?: 'sm' | 'md';
  className?: string;
};

const squareSizes = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-11 w-11 rounded-xl',
};

const wideSizes = {
  sm: 'h-8 w-[4.75rem] rounded-lg',
  md: 'h-11 w-[6.5rem] rounded-xl',
};

export function PaymentMethodIcon({ method, size = 'sm', className }: PaymentMethodIconProps) {
  const containerSize = method.logoWide ? wideSizes[size] : squareSizes[size];

  if (method.logoSrc) {
    return (
      <span
        className={cn(
          'grid shrink-0 place-items-center overflow-hidden',
          method.logoWide && 'bg-white ring-1 ring-line/70',
          containerSize,
          className,
        )}
      >
        <img
          src={method.logoSrc}
          alt=""
          className={cn(
            'h-full w-full object-contain',
            method.logoWide ? 'px-1 py-0.5' : 'p-0.5',
          )}
        />
      </span>
    );
  }

  const Mark = paymentMethodMarks[method.id as keyof typeof paymentMethodMarks];

  if (Mark) {
    return <Mark className={cn('shrink-0', squareSizes[size], className)} />;
  }

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden font-black text-white',
        squareSizes[size],
        method.markClassName,
        className,
      )}
      aria-hidden
    >
      {method.mark}
    </span>
  );
}
