import ReportsClient from './ReportsClient';
import Layout from '../../components/Layout/Layout';

export const metadata = {
  title: 'Inventory Reports',
  description: 'View detailed reports and analytics for your inventory.',
};

export default function ReportsPage() {
  return (
    <Layout>
      <ReportsClient />
    </Layout>
  );
}