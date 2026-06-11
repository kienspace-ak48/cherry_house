import { Link } from 'react-router-dom';
import {
  getBookingStepHref,
  isBookingStepReachable,
} from '../../lib/bookingContext';

const STEPS = [
  { id: 'search', label: 'Tìm' },
  { id: 'property', label: 'Cơ sở' },
  { id: 'branch', label: 'Chi nhánh' },
  { id: 'rooms', label: 'Phòng' },
  { id: 'checkout', label: 'Thanh toán' },
];

/**
 * @param {{
 *   current: 'search' | 'property' | 'branch' | 'rooms' | 'checkout';
 *   context?: import('../../lib/bookingContext').BookingContext;
 *   extra?: { slug?: string; guests?: string };
 * }} props
 */
export default function BookingProgress({ current, context = {}, extra = {} }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);

  return (
    <nav
      aria-label="Tiến trình đặt phòng"
      className="mb-6 overflow-x-auto rounded-xl border border-black/5 bg-white px-3 py-3 shadow-sm sm:px-4"
    >
      <ol className="flex min-w-max items-center gap-1 sm:gap-2">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          const reachable = isBookingStepReachable(step.id, context, extra);
          const href = reachable ? getBookingStepHref(step.id, context, extra) : null;
          const canNavigate = Boolean(href) && !active;
          const disabledReason =
            step.id === 'checkout' && !reachable
              ? 'Chọn phòng và ngày nhận–trả phòng trước'
              : !reachable && !active
                ? 'Hoàn thành bước trước để mở bước này'
                : undefined;

          const chipClass = [
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold sm:px-3 sm:text-sm transition-colors',
            active
              ? 'bg-primary text-white shadow-sm'
              : done
                ? 'bg-primary/10 text-primary'
                : reachable
                  ? 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  : 'text-on-surface-variant/50 cursor-not-allowed',
          ].join(' ');

          const inner = (
            <>
              <span
                className={[
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  active
                    ? 'bg-white/20 text-white'
                    : done
                      ? 'bg-primary text-white'
                      : reachable
                        ? 'bg-black/5 text-on-surface-variant'
                        : 'bg-black/5 text-on-surface-variant/60',
                ].join(' ')}
              >
                {done ? '✓' : idx + 1}
              </span>
              {step.label}
            </>
          );

          return (
            <li key={step.id} className="flex items-center gap-1 sm:gap-2">
              {idx > 0 ? (
                <span
                  className={[
                    'hidden h-px w-4 sm:block sm:w-6',
                    done ? 'bg-primary/50' : 'bg-black/10',
                  ].join(' ')}
                  aria-hidden
                />
              ) : null}
              {canNavigate ? (
                <Link to={href} className={chipClass} title={`Đến bước ${step.label}`}>
                  {inner}
                </Link>
              ) : (
                <span
                  className={chipClass}
                  aria-current={active ? 'step' : undefined}
                  title={disabledReason}
                >
                  {inner}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
