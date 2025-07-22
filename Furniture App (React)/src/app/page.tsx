// src/app/page.tsx
import { PurchaseForm } from '@/components/purchase-form';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PurchaseForm />
    </div>
  );
}
