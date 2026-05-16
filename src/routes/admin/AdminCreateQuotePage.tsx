import { useNavigate } from 'react-router-dom';
import { CreateJobForm, GreetingHero } from '@modules/shared-ui';

export function AdminCreateQuotePage() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <GreetingHero
        title="Create Quote (Admin)"
        subtitle="Author a quote with full override — bypass the catalogue, attach custom terms, send on behalf of any CS."
      />
      <CreateJobForm mode="quote" onSubmit={() => navigate('/admin/new-quotes')} />
    </div>
  );
}
