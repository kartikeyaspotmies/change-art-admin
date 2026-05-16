import { useNavigate } from 'react-router-dom';
import { CreateJobForm, GreetingHero } from '@modules/shared-ui';

export function AdminPlaceOrderPage() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <GreetingHero
        title="Place Order (Admin)"
        subtitle="Direct order placement — pick any client, attach a brief, and drop a job straight into production."
      />
      <CreateJobForm mode="order" onSubmit={() => navigate('/admin/new-jobs')} />
    </div>
  );
}
