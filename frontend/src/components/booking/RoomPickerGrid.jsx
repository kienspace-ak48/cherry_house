import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatPriceVnd } from '../../pages/booking/bookingData';
import {
  buildFloorGrid,
  groupRoomsByFloor,
} from '../../lib/roomFloorLayout';

const LEGEND = [
  {
    id: 'booked',
    label: 'Đã đặt',
    cellClass: 'border-slate-200 bg-slate-100 text-slate-400',
    iconClass: 'text-slate-300',
  },
  {
    id: 'pending',
    label: 'Đang giữ',
    cellClass: 'border-amber-200 bg-amber-50 text-amber-700',
    iconClass: 'text-amber-400',
  },
  {
    id: 'available',
    label: 'Còn trống',
    cellClass: 'border-sky-300 bg-white text-sky-700',
    iconClass: 'text-sky-400',
  },
  {
    id: 'selected',
    label: 'Đang chọn',
    cellClass: 'border-primary bg-primary/10 text-primary shadow-sm',
    iconClass: 'text-primary',
  },
];

function shortRoomCode(code) {
  const raw = String(code);
  const num = raw.match(/(\d+)/)?.[1];
  if (num) return num.padStart(2, '0');
  return raw.length > 6 ? raw.slice(-4) : raw;
}

function cellState(room, selectedId) {
  if (selectedId === room.id) return 'selected';
  return room.status;
}

function cellClassName(state) {
  if (state === 'selected') return LEGEND.find((l) => l.id === 'selected').cellClass;
  if (state === 'booked') return LEGEND.find((l) => l.id === 'booked').cellClass;
  if (state === 'pending') return LEGEND.find((l) => l.id === 'pending').cellClass;
  return LEGEND.find((l) => l.id === 'available').cellClass;
}

function iconClassName(state) {
  if (state === 'selected') return LEGEND.find((l) => l.id === 'selected').iconClass;
  if (state === 'booked') return LEGEND.find((l) => l.id === 'booked').iconClass;
  if (state === 'pending') return LEGEND.find((l) => l.id === 'pending').iconClass;
  return LEGEND.find((l) => l.id === 'available').iconClass;
}

function RoomCell({
  room,
  selectedId,
  datesReady,
  onSelect,
  onBook,
}) {
  const state = cellState(room, selectedId);
  const selectable = room.status === 'available' && datesReady;
  const isSelected = state === 'selected';

  const handleClick = () => {
    if (!selectable) return;
    if (isSelected) onBook?.(room);
    else onSelect?.(room);
  };

  return (
    <button
      type="button"
      disabled={!selectable && !isSelected}
      onClick={handleClick}
      title={
        !datesReady && room.status === 'available'
          ? 'Chọn ngày nhận – trả phòng trước'
          : room.code
      }
      aria-pressed={isSelected}
      className={[
        'group flex min-h-18 w-full flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-1 py-2 text-center transition-all',
        cellClassName(state),
        selectable || isSelected
          ? 'cursor-pointer hover:scale-[1.03] hover:shadow-md active:scale-[0.98]'
          : 'cursor-not-allowed opacity-90',
      ].join(' ')}
    >
      <span
        className={[
          'material-symbols-outlined text-[1.35rem] leading-none',
          iconClassName(state),
        ].join(' ')}
        aria-hidden
      >
        bed
      </span>
      <span className="text-[10px] font-bold tracking-tight sm:text-xs">
        {shortRoomCode(room.code)}
      </span>
    </button>
  );
}

function FloorSection({ floorGroup, selectedId, datesReady, onSelect, onBook }) {
  const cells = useMemo(
    () => buildFloorGrid(floorGroup.rooms),
    [floorGroup.rooms],
  );

  return (
    <section className="min-w-0">
      <h3 className="mb-3 text-sm font-bold text-on-surface">{floorGroup.label}</h3>
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {cells.map((room, idx) => {
          if (!room) {
            return (
              <div
                key={`gap-${floorGroup.floor}-${idx}`}
                className="flex min-h-18 items-center justify-center rounded-lg border border-dashed border-black/5 bg-surface-container-low/50"
                aria-hidden
              >
                <span className="material-symbols-outlined text-lg text-on-surface-variant/30">
                  meeting_room
                </span>
              </div>
            );
          }
          return (
            <RoomCell
              key={room.id}
              room={room}
              selectedId={selectedId}
              datesReady={datesReady}
              onSelect={onSelect}
              onBook={onBook}
            />
          );
        })}
      </div>
    </section>
  );
}

/**
 * Sơ đồ phòng theo tầng — layout tham khảo chọn ghế xe (trống / đã đặt / đang chọn).
 */
export default function RoomPickerGrid({
  rooms,
  selectedId = null,
  datesReady = true,
  branchName = '',
  onSelect,
  onBook,
  detailHrefFor,
}) {
  const floors = useMemo(() => groupRoomsByFloor(rooms), [rooms]);
  const selectedRoom = rooms.find((r) => r.id === selectedId) ?? null;

  if (rooms.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/15 bg-white py-12 text-center text-sm text-on-surface-variant">
        Không có phòng phù hợp bộ lọc tại chi nhánh này.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-black/8 bg-white shadow-sm">
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:gap-8">
        <div className="min-w-0 flex-1 space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface sm:text-xl">
                Chọn phòng
              </h2>
              {branchName ? (
                <p className="mt-1 text-sm text-on-surface-variant">{branchName}</p>
              ) : null}
            </div>
            {!datesReady ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                Chọn ngày lưu trú để đặt phòng
              </p>
            ) : null}
          </div>

          {floors.map((floorGroup) => (
            <FloorSection
              key={floorGroup.floor}
              floorGroup={floorGroup}
              selectedId={selectedId}
              datesReady={datesReady}
              onSelect={onSelect}
              onBook={onBook}
            />
          ))}
        </div>

        <aside className="w-full shrink-0 lg:w-52">
          <p className="mb-3 text-xs font-bold tracking-wide text-on-surface-variant uppercase">
            Trạng thái
          </p>
          <ul className="space-y-3">
            {LEGEND.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <span
                  className={[
                    'flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border-2',
                    item.cellClass,
                  ].join(' ')}
                >
                  <span className={['material-symbols-outlined text-lg', item.iconClass].join(' ')}>
                    bed
                  </span>
                </span>
                <span className="text-sm font-medium text-on-surface">{item.label}</span>
              </li>
            ))}
          </ul>

          {selectedRoom ? (
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-[10px] font-bold tracking-wide text-primary uppercase">
                Phòng đang chọn
              </p>
              <p className="mt-1 font-headline text-base font-bold text-on-surface">
                {selectedRoom.code}
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">{selectedRoom.type}</p>
              <p className="mt-2 font-bold text-primary">
                {formatPriceVnd(selectedRoom.priceVnd)}
                <span className="text-xs font-semibold text-on-surface-variant"> / đêm</span>
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onBook?.(selectedRoom)}
                  disabled={!datesReady}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Tiếp tục đặt phòng
                </button>
                {detailHrefFor?.(selectedRoom) ? (
                  <Link
                    to={detailHrefFor(selectedRoom)}
                    className="text-center text-xs font-bold text-primary hover:underline"
                  >
                    Xem chi tiết phòng
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-xs leading-relaxed text-on-surface-variant">
              Nhấn phòng còn trống để chọn, nhấn lần nữa hoặc dùng nút bên dưới để sang bước thanh toán.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
