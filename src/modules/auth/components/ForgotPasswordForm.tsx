import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '@modules/auth/services';
import { ApiClientError } from '@lib/api-client';

const ForgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

type ForgotValues = z.infer<typeof ForgotSchema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(ForgotSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotValues) {
    setServerError(null);
    try {
      await authService.requestPasswordReset(values.email);
      setSent(true);
    } catch (err) {
      // Don't leak whether the email exists — show the same success state
      // for unknown emails. Only network errors surface to the user.
      if (err instanceof ApiClientError && err.status === 0) {
        setServerError(err.toUserMessage());
        return;
      }
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div aria-live="polite">
        <h2 className="text-[18px] font-bold mb-1">Check your inbox</h2>
        <p className="text-[12.5px] text-text-muted mb-6">
          If that email is registered, a reset link is on its way. Please follow the
          instructions in the email.
        </p>
        <Link to="/login" className="btn btn-outline w-full justify-center">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Reset password">
      <h2 className="text-[18px] font-bold mb-1">Reset your password</h2>
      <p className="text-[12.5px] text-text-muted mb-6">
        Enter the email you signed up with and we'll send you a reset link.
      </p>

      <label className="block mb-5">
        <span className="lbl">Email</span>
        <input
          type="email"
          autoComplete="email"
          className="inp"
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'fp-email-error' : undefined}
          {...register('email')}
        />
        {errors.email ? (
          <p id="fp-email-error" className="text-[11px] text-status-red mt-1" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </label>

      {serverError ? (
        <div
          role="alert"
          className="text-[12px] mb-3 p-2.5 rounded-lg border border-status-red/30 bg-status-red/10 text-[#fca5a5]"
        >
          {serverError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="btn btn-crimson w-full"
      >
        {isSubmitting ? 'Sending…' : 'Send reset link'}
      </button>

      <p className="text-[11.5px] text-text-muted mt-6 text-center">
        Remembered it?{' '}
        <Link to="/login" className="text-crimson hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
