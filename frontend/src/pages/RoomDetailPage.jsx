import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LAYOUT_CONTAINER } from '../constants/layoutContainer';
import { resolveRoomDetail } from '../data/roomDetails';
import { formatPriceVnd } from './booking/bookingData';

function RoomDetailPage() {
  const { slug } = useParams();
  const detail = slug ? resolveRoomDetail(slug) : null;
  const [guests, setGuests] = useState('2-adults-0-children');

  if (!detail) {
    return (
      <div className={[LAYOUT_CONTAINER, 'pt-28 pb-24 text-center'].join(' ')}>
        <div className="mx-auto max-w-lg">
          <h1 className="font-headline text-2xl font-bold text-on-surface">Không tìm thấy phòng</h1>
          <p className="mt-4 text-on-surface-variant">Slug không hợp lệ hoặc phòng đã gỡ.</p>
          <Link
            to="/booking"
            className="mt-8 inline-block rounded-full bg-primary px-8 py-3 font-bold text-white hover:brightness-110"
          >
            Xem bảng phòng
          </Link>
        </div>
      </div>
    );
  }

  const [main, ...rest] = detail.gallery;
  const [a, b, c] = [rest[0], rest[1], rest[2]].map((u) => u || main);

  const checkoutHref = `/checkout?${new URLSearchParams({
    slug: detail.slug,
    guests,
  }).toString()}`;

  return (
    <div className="pb-24 lg:pb-16">
      <div className={[LAYOUT_CONTAINER, 'pt-24'].join(' ')}>
        {/* Gallery — mobile: stack + snap row; desktop: asymmetric grid */}
        <div className="mb-10 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:pb-0 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-[85vw] shrink-0 snap-center md:min-w-0 lg:row-span-2">
            <img
              src={main}
              alt=""
              className="h-72 w-full rounded-2xl object-cover sm:h-80 md:h-full md:min-h-[320px] lg:min-h-[420px]"
            />
          </div>
          <div className="hidden min-w-0 grid-cols-2 gap-3 md:grid">
            <img src={a} alt="" className="h-40 w-full rounded-2xl object-cover lg:h-48" />
            <img src={b} alt="" className="h-40 w-full rounded-2xl object-cover lg:h-48" />
          </div>
          <div className="hidden md:col-span-1 md:col-start-2 md:row-start-2 md:block lg:col-start-2">
            <img src={c} alt="" className="h-36 w-full rounded-2xl object-cover lg:h-44" />
          </div>
        </div>
        {/* Mobile secondary thumbs */}
        <div className="-mt-4 mb-10 flex snap-x gap-2 overflow-x-auto pb-2 md:hidden">
          {[a, b, c].map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="h-24 w-32 shrink-0 snap-start rounded-xl object-cover"
            />
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-12">
          <article>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold tracking-wide text-primary uppercase">
              <span className="material-symbols-outlined text-base">verified</span>
              {detail.badge}
            </div>
            <h1 className="font-headline text-3xl font-bold text-on-surface md:text-4xl lg:text-5xl">
              {detail.title}
            </h1>

            <div className="mt-6 flex flex-wrap gap-4 border-b border-black/10 pb-6 text-sm text-on-surface-variant">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">square_foot</span>
                {detail.areaSqm} m²
              </span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bed</span>
                {detail.bedLabel}
              </span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">group</span>
                {detail.capacityLabel}
              </span>
            </div>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-on-surface-variant">
              {detail.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <h2 className="font-headline mt-12 text-xl font-bold text-on-surface">
              Tiện nghi phòng
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {detail.amenities.map((am) => (
                <li
                  key={am.label}
                  className="flex items-center gap-3 rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm"
                >
                  <span className="material-symbols-outlined text-primary">{am.icon}</span>
                  <span className="text-sm font-medium text-on-surface">{am.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-12 rounded-2xl bg-surface-container/80 p-6 md:p-8">
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Chính sách hủy phòng
              </h2>
              <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-on-surface-variant">
                {detail.policyBullets.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-semibold text-on-surface">
                Nhận phòng từ {detail.checkIn} · Trả phòng trước {detail.checkOut}
              </p>
            </div>
          </article>

          {/* Sidebar — desktop sticky */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-black/5 bg-white p-6 shadow-xl shadow-black/5">
              <p className="font-headline text-lg font-bold text-primary">
                Giá chỉ từ {formatPriceVnd(detail.priceVnd)}
              </p>
              <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                    Ngày nhận phòng
                  </label>
                  <div className="flex items-center gap-2 rounded-xl bg-surface-container px-3 py-3">
                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                    <input type="date" className="w-full bg-transparent text-sm font-medium" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                    Ngày trả phòng
                  </label>
                  <div className="flex items-center gap-2 rounded-xl bg-surface-container px-3 py-3">
                    <span className="material-symbols-outlined text-primary">event</span>
                    <input type="date" className="w-full bg-transparent text-sm font-medium" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                    Khách hàng
                  </label>
                  <div className="flex items-center gap-2 rounded-xl bg-surface-container px-3 py-3">
                    <span className="material-symbols-outlined text-primary">group</span>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium"
                    >
                      <option value="2-adults-0-children">2 Người lớn, 0 Trẻ em</option>
                      <option value="2-adults-1-child">2 Người lớn, 1 Trẻ em</option>
                      <option value="1-adult-0-children">1 Người lớn</option>
                    </select>
                  </div>
                </div>
                <Link
                  to={checkoutHref}
                  className="flex w-full items-center justify-center rounded-xl bg-primary py-4 text-center text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-110"
                >
                  Đặt phòng ngay
                </Link>
              </form>
              <p className="mt-4 text-center text-xs text-on-surface-variant">
                Đảm bảo giá tốt nhất khi đặt trực tiếp với Cherry House.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className={[LAYOUT_CONTAINER, 'flex items-center justify-between gap-3'].join(' ')}>
          <div>
            <p className="text-xs text-on-surface-variant">Từ</p>
            <p className="font-headline text-sm font-bold text-primary">
              {formatPriceVnd(detail.priceVnd)}
            </p>
          </div>
          <Link
            to={checkoutHref}
            className="shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:brightness-110"
          >
            Đặt phòng ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RoomDetailPage;
