import { Link } from 'react-router-dom';

/**
 * @param {{ items: { label: string; href?: string; current?: boolean }[]; className?: string }} props
 */
export default function BookingBreadcrumbs({ items, className = '' }) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Đường dẫn đặt phòng"
      className={['flex flex-wrap items-center gap-x-2 text-sm text-on-surface-variant', className].join(' ')}
    >
      {items.map((item, idx) => (
        <span key={`${item.label}-${idx}`} className="inline-flex items-center gap-2">
          {idx > 0 ? <span aria-hidden>/</span> : null}
          {item.current || !item.href ? (
            <span className={item.current ? 'font-semibold text-on-surface' : undefined}>
              {item.label}
            </span>
          ) : (
            <Link to={item.href} className="font-medium text-primary hover:underline">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
