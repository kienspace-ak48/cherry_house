import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  VI_MONTH_LABELS,
  addDaysIso,
  compareIso,
  countNights,
  daysInMonth,
  formatViRangePart,
  parseIso,
  startWeekday,
  todayIso,
  toIsoDate,
} from '../../lib/dateRange';

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const POPOVER_MAX_WIDTH = 672;

/**
 * @param {{
 *   checkIn?: string;
 *   checkOut?: string;
 *   onChange: (range: { checkIn?: string; checkOut?: string }) => void;
 *   variant?: 'hero' | 'default';
 *   label?: string;
 *   placeholder?: string;
 *   minDate?: string;
 *   className?: string;
 * }} props
 */
export default function DateRangePicker({
  checkIn = '',
  checkOut = '',
  onChange,
  variant = 'default',
  label = 'Ngày ở',
  placeholder = 'Chọn ngày nhận – trả phòng',
  minDate = todayIso(),
  className = '',
}) {
  const uid = useId().replace(/:/g, '');
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [hoverIso, setHoverIso] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: POPOVER_MAX_WIDTH });

  const anchor = parseIso(checkIn) ?? new Date();
  const [viewYear, setViewYear] = useState(anchor.getFullYear());
  const [viewMonth, setViewMonth] = useState(anchor.getMonth());

  const isHero = variant === 'hero';
  const nights = countNights(checkIn, checkOut);

  const displayText = useMemo(() => {
    if (checkIn && checkOut) {
      return `${formatViRangePart(checkIn)} → ${formatViRangePart(checkOut)}`;
    }
    if (checkIn) return `${formatViRangePart(checkIn)} → Chọn ngày trả`;
    return placeholder;
  }, [checkIn, checkOut, placeholder]);

  const updatePopoverPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(POPOVER_MAX_WIDTH, window.innerWidth - 32);
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - width - 16));
    const top = rect.bottom + 8;
    setPopoverPos({ top, left, width });
  };

  useEffect(() => {
    if (!open) return undefined;
    updatePopoverPosition();
    const onResize = () => updatePopoverPosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const shiftMonth = (delta) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleDayClick = (iso) => {
    if (compareIso(iso, minDate) < 0) return;

    if (!checkIn || (checkIn && checkOut)) {
      onChange({ checkIn: iso, checkOut: '' });
      setPhase('end');
      return;
    }

    if (compareIso(iso, checkIn) <= 0) {
      onChange({ checkIn: iso, checkOut: '' });
      setPhase('end');
      return;
    }

    onChange({ checkIn, checkOut: iso });
    setPhase('idle');
    setOpen(false);
  };

  const clearRange = () => {
    onChange({ checkIn: '', checkOut: '' });
    setPhase('idle');
  };

  const applyPreset = (nightsCount) => {
    const start = checkIn && compareIso(checkIn, minDate) >= 0 ? checkIn : minDate;
    onChange({ checkIn: start, checkOut: addDaysIso(start, nightsCount) });
    setOpen(false);
  };

  const inRange = (iso) => {
    const end = checkOut || (phase === 'end' && hoverIso && checkIn ? hoverIso : '');
    if (!checkIn || !end) return false;
    const lo = compareIso(checkIn, end) <= 0 ? checkIn : end;
    const hi = compareIso(checkIn, end) <= 0 ? end : checkIn;
    return compareIso(iso, lo) >= 0 && compareIso(iso, hi) <= 0;
  };

  const renderMonth = (year, monthIndex) => {
    const total = daysInMonth(year, monthIndex);
    const leading = startWeekday(year, monthIndex);
    const cells = [];

    for (let i = 0; i < leading; i += 1) {
      cells.push(<div key={`e-${year}-${monthIndex}-${i}`} className="date-range-day date-range-day--empty" />);
    }

    for (let day = 1; day <= total; day += 1) {
      const iso = toIsoDate(new Date(year, monthIndex, day));
      const disabled = compareIso(iso, minDate) < 0;
      const isStart = iso === checkIn;
      const isEnd = iso === checkOut;
      const ranged = inRange(iso);
      cells.push(
        <button
          key={iso}
          type="button"
          disabled={disabled}
          onClick={() => handleDayClick(iso)}
          onMouseEnter={() => !disabled && phase === 'end' && setHoverIso(iso)}
          onMouseLeave={() => setHoverIso(null)}
          className={[
            'date-range-day',
            disabled ? 'date-range-day--disabled' : '',
            ranged ? 'date-range-day--in-range' : '',
            isStart ? 'date-range-day--start' : '',
            isEnd ? 'date-range-day--end' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {day}
        </button>,
      );
    }

    return (
      <div className="date-range-month">
        <p className="date-range-month-title">
          {VI_MONTH_LABELS[monthIndex]} {year}
        </p>
        <div className="date-range-weekdays">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="date-range-grid">{cells}</div>
      </div>
    );
  };

  const month2 = new Date(viewYear, viewMonth + 1, 1);

  const triggerClass = isHero
    ? 'flex w-full items-center gap-2 text-left'
    : 'flex w-full items-center gap-2 rounded-xl border border-black/10 bg-surface px-3 py-2.5 text-left';

  const popoverContent = (
    <div
      ref={popoverRef}
      className="date-range-popover date-range-popover--portal"
      role="dialog"
      aria-label="Chọn ngày ở"
      style={{
        position: 'fixed',
        top: popoverPos.top,
        left: popoverPos.left,
        width: popoverPos.width,
        zIndex: 10000,
      }}
    >
      <div className="date-range-popover-head">
        <div>
          <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">Chọn ngày</p>
          <p className="mt-0.5 text-sm font-semibold text-on-surface">
            {checkIn && checkOut
              ? `${formatViRangePart(checkIn)} → ${formatViRangePart(checkOut)}`
              : checkIn
                ? 'Chọn ngày trả phòng'
                : 'Chọn ngày nhận phòng'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="date-range-nav" onClick={() => shiftMonth(-1)} aria-label="Tháng trước">
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button type="button" className="date-range-nav" onClick={() => shiftMonth(1)} aria-label="Tháng sau">
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="date-range-calendars">
        {renderMonth(viewYear, viewMonth)}
        {renderMonth(month2.getFullYear(), month2.getMonth())}
      </div>

      <div className="date-range-presets">
        <span className="text-xs text-on-surface-variant">Gợi ý:</span>
        {[1, 2, 3].map((n) => (
          <button key={n} type="button" className="date-range-preset" onClick={() => applyPreset(n)}>
            {n} đêm
          </button>
        ))}
      </div>

      <div className="date-range-popover-foot">
        <button type="button" className="text-xs font-semibold text-on-surface-variant hover:text-primary" onClick={clearRange}>
          Xóa ngày
        </button>
        {checkIn && checkOut ? (
          <button type="button" className="date-range-apply" onClick={() => setOpen(false)}>
            Xong
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className={['date-range-picker', className].join(' ')}>
      <label className={isHero ? 'mb-1 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase' : 'mb-1.5 block text-[10px] font-bold tracking-wide text-on-surface-variant uppercase'} htmlFor={`${uid}-trigger`}>
        {label}
      </label>
      <button
        ref={triggerRef}
        id={`${uid}-trigger`}
        type="button"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next) requestAnimationFrame(updatePopoverPosition);
            return next;
          });
        }}
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className={['material-symbols-outlined text-primary', isHero ? 'text-xl' : ''].join(' ')}>
          date_range
        </span>
        <span className={['min-w-0 flex-1 truncate font-medium', checkIn ? 'text-on-surface' : 'text-on-surface-variant/60', isHero ? '' : 'text-sm'].join(' ')}>
          {displayText}
        </span>
        {nights > 0 ? (
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            {nights} đêm
          </span>
        ) : null}
        <span className="material-symbols-outlined text-base text-on-surface-variant/70">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && typeof document !== 'undefined' ? createPortal(popoverContent, document.body) : null}
    </div>
  );
}
