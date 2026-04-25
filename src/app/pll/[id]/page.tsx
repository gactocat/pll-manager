import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PllDetail } from '@/components/PllDetail';
import { PLL_IDS, type PllId } from '@/types/pll';

export function generateStaticParams() {
  return PLL_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PllDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!PLL_IDS.includes(id as PllId)) {
    notFound();
  }
  return (
    <Suspense fallback={null}>
      <PllDetail pllId={id as PllId} />
    </Suspense>
  );
}
