import { ReceiptClient } from './receipt-client';

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReceiptClient id={id} />;
}
