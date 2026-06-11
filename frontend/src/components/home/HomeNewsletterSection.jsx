import { useState } from 'react';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {{
 *   title: string;
 *   description: string;
 *   placeholder: string;
 *   buttonLabel: string;
 *   successMessage: string;
 * }} props
 */
function HomeNewsletterSection({
  title,
  description,
  placeholder,
  buttonLabel,
  successMessage,
}) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }
    setError('');
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section id="newsletter" className="scroll-mt-28 bg-primary py-14 text-on-primary md:py-20">
      <div className={LAYOUT_CONTAINER}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-headline text-2xl font-extrabold leading-tight md:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
            {description}
          </p>

          {submitted ? (
            <p className="mt-8 rounded-2xl bg-white/10 px-6 py-4 text-sm font-medium text-white md:text-base">
              {successMessage}
            </p>
          ) : (
            <form
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-stretch"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="flex-1">
                <label className="sr-only" htmlFor="newsletter-email">
                  Email
                </label>
                <input
                  id="newsletter-email"
                  className="w-full rounded-full border-0 bg-white px-5 py-3.5 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-white/40"
                  placeholder={placeholder}
                  type="email"
                  name="newsletter-email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                />
                {error ? <p className="mt-2 text-left text-xs text-white/90">{error}</p> : null}
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-full border-2 border-on-surface bg-on-surface px-8 py-3.5 font-headline text-sm font-bold tracking-wide text-white transition-colors hover:bg-on-surface/90"
              >
                {buttonLabel}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default HomeNewsletterSection;
