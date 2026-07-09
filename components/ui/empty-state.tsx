import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function EmptyState({ title = 'Vault not found', message = 'Create a new commitment savings vault to continue.' }) {
  return (
    <div className="rounded-3xl border border-orange-100 bg-white/90 p-8 text-center shadow-card">
      <p className="text-2xl font-black text-slate-950">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{message}</p>
      <Link href="/create-vault" className="mt-5 inline-flex">
        <Button>Create a Betless Vault</Button>
      </Link>
    </div>
  );
}
