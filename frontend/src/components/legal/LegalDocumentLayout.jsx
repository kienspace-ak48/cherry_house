import { Link } from 'react-router-dom';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';

/**
 * @param {{ eyebrow?: string; title: string; updatedAt?: string; children: import('react').ReactNode }} props
 */
function LegalDocumentLayout({ eyebrow = 'Pháp lý', title, updatedAt, children }) {
  return (
    <div className="bg-surface pb-20">
      <div className={[LAYOUT_CONTAINER, 'pt-24 md:pt-28'].join(' ')}>
        <p className="font-headline text-xs font-bold tracking-[0.2em] text-primary uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-headline text-3xl font-extrabold text-on-surface md:text-4xl">
          {title}
        </h1>
        {updatedAt ? (
          <p className="mt-3 text-sm text-on-surface-variant">Cập nhật lần cuối: {updatedAt}</p>
        ) : null}

        <article className="prose-cherry mt-10 max-w-3xl space-y-8 text-sm leading-relaxed text-on-surface-variant md:text-base">
          {children}
        </article>

        <p className="mt-12 text-sm text-on-surface-variant">
          Có thắc mắc?{' '}
          <Link to="/contact" className="font-semibold text-primary hover:underline">
            Liên hệ Cherry House
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * @param {{ title: string; children: import('react').ReactNode }} props
 */
export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="font-headline text-lg font-bold text-on-surface md:text-xl">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default LegalDocumentLayout;
