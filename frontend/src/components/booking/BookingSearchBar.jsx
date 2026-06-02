import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CTA,
  buildUrl,
  discoveryContext,
  formValuesToContext,
  formatContextSummary,
  getDiscoveryHref,
  mergeContext,
} from '../../lib/bookingContext';
import { PROPERTY_KIND_LABELS } from '../../data/properties';
import { BOOKING_CITY_OPTIONS } from '../../constants/bookingCities';

const KIND_OPTIONS = [
  { value: 'all', label: 'Tất cả loại hình' },
  ...Object.entries(PROPERTY_KIND_LABELS).map(([value, label]) => ({ value, label })),
];

export default function BookingSearchBar({
  variant = 'compact',
  initialContext = {},
  onSubmit,
  showKind = variant !== 'hero',
  className = '',
  id = 'booking-search',
}) {
  const [city, setCity] = useState(initialContext.city ?? initialContext.q ?? '');
  const [checkIn, setCheckIn] = useState(initialContext.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(initialContext.checkOut ?? '');
  const [kind, setKind] = useState(initialContext.kind ?? 'all');

  useEffect(() => {
    setCity(initialContext.city ?? initialContext.q ?? '');
    setCheckIn(initialContext.checkIn ?? '');
    setCheckOut(initialContext.checkOut ?? '');
    setKind(initialContext.kind ?? 'all');
  }, [
    initialContext.city,
    initialContext.q,
    initialContext.checkIn,
    initialContext.checkOut,
    initialContext.kind,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const ctx = formValuesToContext({ city, checkIn, checkOut, kind });
    const merged = mergeContext(discoveryContext(initialContext), ctx);
    onSubmit?.(merged);
  };

  if (variant === 'summary') {
    const summary = formatContextSummary(initialContext);
    return (
      <div
        className={[
          'flex flex-col gap-3 rounded-xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center sm:justify-between',
          className,
        ].join(' ')}
      >
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-wide text-on-surface-variant uppercase">
            Tìm kiếm của bạn
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-on-surface">
            {summary || 'Chưa chọn địa điểm hoặc ngày'}
          </p>
        </div>
        <Link
          to={getDiscoveryHref(initialContext, { focus: 'search' })}
          className="shrink-0 text-sm font-bold text-primary hover:underline"
        >
          {CTA.editSearch}
        </Link>
      </div>
    );
  }

  const isHero = variant === 'hero';
  const shellClass = isHero
    ? 'mx-auto flex max-w-5xl flex-col gap-2 rounded-xl border border-outline-variant/15 bg-white p-2 shadow-2xl md:flex-row md:items-center md:rounded-full'
    : 'flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm md:flex-row md:flex-wrap md:items-end';

  const fieldShell = isHero
    ? 'flex flex-1 flex-col items-start px-6 py-3 text-left'
    : 'min-w-0 flex-1 md:min-w-[140px]';

  const labelClass = isHero
    ? 'mb-1 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase'
    : 'mb-1.5 block text-[10px] font-bold tracking-wide text-on-surface-variant uppercase';

  const inputWrapClass = isHero
    ? 'flex w-full items-center gap-2'
    : 'flex items-center gap-2 rounded-xl border border-black/10 bg-surface px-3 py-2.5';

  const inputClass = isHero
    ? 'w-full border-none bg-transparent p-0 font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0'
    : 'min-w-0 flex-1 border-none bg-transparent text-sm font-medium text-on-surface placeholder:text-on-surface-variant/60 focus:ring-0';

  const btnClass = isHero
    ? 'rounded-xl bg-primary px-10 py-4 text-center font-headline text-sm font-bold tracking-widest text-on-primary uppercase transition-all hover:bg-primary-container active:scale-95 md:rounded-full'
    : 'rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-md shadow-primary/20 transition-all hover:brightness-110 md:shrink-0';

  return (
    <form id={id} onSubmit={handleSubmit} className={[shellClass, className].join(' ')}>
      <div className={fieldShell}>
        <label className={labelClass} htmlFor={`${id}-city`}>
          Địa điểm
        </label>
        <div className={inputWrapClass}>
          <span
            className={[
              'material-symbols-outlined text-primary',
              isHero ? 'text-xl' : '',
            ].join(' ')}
          >
            location_on
          </span>
          <input
            id={`${id}-city`}
            className={inputClass}
            placeholder="Đà Lạt, Vũng Tàu, Đà Nẵng..."
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            list={`${id}-cities`}
          />
          <datalist id={`${id}-cities`}>
            {BOOKING_CITY_OPTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      {isHero && <div className="hidden h-10 w-px bg-surface-variant md:block" aria-hidden />}

      <div className={fieldShell}>
        <label className={labelClass} htmlFor={`${id}-check-in`}>
          Ngày nhận phòng
        </label>
        <div className={inputWrapClass}>
          <span
            className={[
              'material-symbols-outlined text-primary',
              isHero ? 'text-xl' : '',
            ].join(' ')}
          >
            calendar_today
          </span>
          <input
            id={`${id}-check-in`}
            className={inputClass}
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
      </div>

      {isHero && <div className="hidden h-10 w-px bg-surface-variant md:block" aria-hidden />}

      <div className={fieldShell}>
        <label className={labelClass} htmlFor={`${id}-check-out`}>
          Ngày trả phòng
        </label>
        <div className={inputWrapClass}>
          <span
            className={[
              'material-symbols-outlined text-primary',
              isHero ? 'text-xl' : '',
            ].join(' ')}
          >
            event_busy
          </span>
          <input
            id={`${id}-check-out`}
            className={inputClass}
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
      </div>

      {showKind && (
        <div className={[fieldShell, isHero ? '' : 'md:max-w-[180px]'].join(' ')}>
          <label className={labelClass} htmlFor={`${id}-kind`}>
            Loại hình
          </label>
          <select
            id={`${id}-kind`}
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className={
              isHero
                ? 'w-full border-none bg-transparent p-0 text-sm font-medium text-on-surface focus:ring-0'
                : 'w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm font-medium text-on-surface'
            }
          >
            {KIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <button type="submit" className={btnClass}>
        {CTA.searchSubmit}
      </button>
    </form>
  );
}
