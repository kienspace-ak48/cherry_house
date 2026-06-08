import { Link } from 'react-router-dom';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[70vh] bg-surface pb-20 pt-24 font-body md:pt-28">
      <div className={[LAYOUT_CONTAINER, 'mx-auto max-w-lg'].join(' ')}>
        <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-white shadow-lg shadow-primary/5">
          <div className="border-b border-outline-variant/20 bg-linear-to-br from-primary/[0.08] via-white to-secondary-container/40 px-6 py-8 text-center md:px-8">
            <Link
              to="/"
              className="font-headline text-xl font-bold italic text-primary hover:underline"
            >
              Cherry House
            </Link>
            <h1 className="mt-4 font-headline text-2xl font-bold text-on-surface">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{subtitle}</p>
            ) : null}
          </div>
          <div className="px-6 py-8 md:px-8">{children}</div>
          {footer ? (
            <div className="border-t border-outline-variant/20 bg-surface-container-low/30 px-6 py-4 text-center text-sm text-on-surface-variant md:px-8">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
