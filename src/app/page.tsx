import { Suspense } from 'react';
import { Home } from '@/components/Home';

export default function HomePage() {
  // Suspense boundary required because Home reads ?mode= via useSearchParams.
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
