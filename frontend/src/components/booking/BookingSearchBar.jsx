import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DateRangePicker from './DateRangePicker';
import {
  CTA,
  discoveryContext,
  formValuesToContext,
  formatContextSummary,
  getDiscoveryHref,
  mergeContext,
} from '../../lib/bookingContext';
import { PROPERTY_KIND_LABELS } from '../../data/properties';
import { fetchProvinces } from '../../api/geoApi';
import {
  BOOKING_PROVINCE_OPTIONS_FALLBACK,
  setBookingProvinceOptions,
} from '../../constants/bookingProvinces';

const KIND_OPTIONS = [
  { value: 'all', label: 'Tất cả loại hình' },
  ...Object.entries(PROPERTY_KIND_LABELS).map(([value, label]) => ({ value, label })),
];

export default function BookingSearchBar({
  variant = 'compact',
  initialContext = {},
  onSubmit,
  showKind = variant !== 'hero',
  requireDates = true,
  className = '',
  id = 'booking-search',
}) {
  const [city, setCity] = useState(initialContext.city ?? initialContext.q ?? '');
  const [checkIn, setCheckIn] = useState(initialContext.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(initialContext.checkOut ?? '');
  const [kind, setKind] = useState(initialContext.kind ?? 'all');
  const [dateError, setDateError] = useState('');
  const [cityOptions, setCityOptions] = useState(BOOKING_PROVINCE_OPTIONS_FALLBACK);

  useEffect(() => {
    let cancelled = false;
    fetchProvinces()
      .then((rows) => {
        const provinces = (rows ?? [])
          .map((p) => (typeof p === 'string' ? p : p?.name))
          .filter(Boolean);
        if (cancelled || !provinces.length) return;
        setBookingProvinceOptions(provinces);
        setCityOptions(provinces);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
    setDateError('');

    if (requireDates && (!checkIn || !checkOut)) {
      setDateError('Chọn ngày nhận và trả phòng để tìm phòng trống.');
      return;
    }

    const { ctx, error } = formValuesToContext({ city, checkIn, checkOut, kind });
    if (error) {
      setDateError(error);
      return;
    }

    const merged = mergeContext(discoveryContext(initialContext), ctx);
    onSubmit?.(merged);
  };

  const handleRangeChange = ({ checkIn: inVal, checkOut: outVal }) => {
    setCheckIn(inVal ?? '');
    setCheckOut(outVal ?? '');
    if (dateError) setDateError('');
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
    ? 'mx-auto flex max-w-5xl flex-col gap-2 rounded-2xl border border-white/20 bg-white/95 p-2 shadow-2xl backdrop-blur-md md:flex-row md:items-stretch md:rounded-full md:p-2'
    : 'flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm md:flex-row md:flex-wrap md:items-end';

  const fieldShell = isHero
    ? 'flex flex-1 flex-col items-start justify-center px-5 py-3 text-left md:px-6'
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
    ? 'rounded-xl bg-primary px-8 py-4 text-center font-headline text-sm font-bold tracking-widest text-on-primary uppercase shadow-lg shadow-primary/25 transition-all hover:bg-primary-container active:scale-[0.98] md:my-1.5 md:mr-1.5 md:rounded-full md:px-10'
    : 'rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-md shadow-primary/20 transition-all hover:brightness-110 md:shrink-0';

  return (
    <form id={id} onSubmit={handleSubmit} className={[shellClass, className].join(' ')}>
      <div className={fieldShell}>
        <label className={labelClass} htmlFor={`${id}-city`}>
          Tỉnh/thành
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
          <select
            id={`${id}-city`}
            className={inputClass}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">Tất cả tỉnh/thành</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isHero && <div className="hidden w-px self-stretch bg-outline-variant/25 md:block" aria-hidden />}

      <div className={[fieldShell, isHero ? 'min-w-[220px] md:min-w-[280px]' : 'md:min-w-[200px]'].join(' ')}>
        <DateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={handleRangeChange}
          variant={isHero ? 'hero' : 'default'}
          label="Ngày ở"
          placeholder="Chọn ngày nhận – trả phòng"
        />
        {dateError ? (
          <p className="mt-1.5 text-xs font-semibold text-red-600" role="alert">
            {dateError}
          </p>
        ) : requireDates ? (
          null
          // <p className="mt-1.5 text-[11px] text-on-surface-variant">
          //   Bắt buộc để kiểm tra phòng trống theo ngày.
          // </p>
        ) : null}
      </div>

      {showKind && (
        <>
          {isHero && <div className="hidden w-px self-stretch bg-outline-variant/25 md:block" aria-hidden />}
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
        </>
      )}

      <button type="submit" className={btnClass}>
        <span className="material-symbols-outlined align-middle text-lg md:hidden">search</span>
        <span className={isHero ? '' : ''}>{CTA.searchSubmit}</span>
      </button>
    </form>
  );
}

