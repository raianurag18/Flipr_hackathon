'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout/Layout';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  return (
    <div>
      <h1 className="text-2xl font-bold">Search Results</h1>
      <p className="mt-2">
        Showing results for: <strong>{query}</strong>
      </p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchResults />
      </Suspense>
    </Layout>
  );
}
