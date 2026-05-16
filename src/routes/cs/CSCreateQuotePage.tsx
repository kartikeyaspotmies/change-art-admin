import { useNavigate } from 'react-router-dom';
import { CreateJobForm, GreetingHero } from '@modules/shared-ui';

export function CSCreateQuotePage() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <GreetingHero
        title="Create New Quote for Client"
        subtitle="Author a quote on behalf of a client. The submitted request is routed for pricing and client approval."
      />
      <CreateJobForm
        mode="quote"
        onSubmit={(id) => {
          console.info(`Quote ${id} created`);
          navigate('/cs/new-quotes');
        }}
      />
    </div>
  );
}
