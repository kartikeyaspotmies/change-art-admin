import { useNavigate } from 'react-router-dom';
import { CreateJobForm, GreetingHero } from '@modules/shared-ui';

export function CSPlaceOrderPage() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <GreetingHero
        title="Place Order on Behalf of Client"
        subtitle="Submit a confirmed order directly into the production pipeline."
      />
      <CreateJobForm
        mode="order"
        onSubmit={(id) => {
          console.info(`Order ${id} placed`);
          navigate('/cs/new-jobs');
        }}
      />
    </div>
  );
}
