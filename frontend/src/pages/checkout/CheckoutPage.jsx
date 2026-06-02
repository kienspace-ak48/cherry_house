import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BookingProgress from '../../components/booking/BookingProgress';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';
import { readProfileContact } from '../../data/profileContact';
import { buildUrl, getDiscoveryHref, parseBookingContext } from '../../lib/bookingContext';
import { MOCK_ROOMS } from '../booking/bookingData';
import { resolveRoomDetail } from '../../data/roomDetails';
import { STITCH_CHECKOUT_IMG } from './checkoutDefaults';

const GUEST_LABEL = {
  '2-adults-0-children': '2 Người lớn, 0 Trẻ em',
  '2-adults-1-child': '2 Người lớn, 1 Trẻ em',
  '1-adult-0-children': '1 Người lớn',
};

const PROMO_OK = ['CHERRY10', 'CHERRYVIP'];

const PAY_OPTIONS = [
  {
    id: 'card',
    icon: 'credit_card',
    title: 'Thẻ tín dụng / Ghi nợ',
    subtitle: 'Visa, Mastercard, JCB, American Express',
  },
  {
    id: 'bank',
    icon: 'account_balance',
    title: 'Chuyển khoản ngân hàng',
    subtitle: 'Xác nhận nhanh trong vòng 15 phút',
  },
  {
    id: 'wallet',
    icon: 'qr_code_2',
    title: 'Ví điện tử (Momo/ZaloPay)',
    subtitle: 'Thanh toán một chạm cực kỳ tiện lợi',
  },
];

function fmtMoneyCompact(amountVnd) {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amountVnd))}đ`;
}

function parseGuestsParam(raw) {
  if (!raw) return '2-adults-1-child';
  if (raw in GUEST_LABEL) return raw;
  return '2-adults-1-child';
}

function checkoutDates(searchParams, nightsFallback, contextFallback = {}) {
  const inRaw = searchParams.get('checkIn') || contextFallback.checkIn;
  const outRaw = searchParams.get('checkOut') || contextFallback.checkOut;
  let checkInDate = null;
  let checkOutDate = null;

  if (inRaw && outRaw) {
    const start = new Date(`${inRaw}T12:00:00`);
    const end = new Date(`${outRaw}T12:00:00`);
    if (!Number.isNaN(+start) && !Number.isNaN(+end) && end > start) {
      checkInDate = start;
      checkOutDate = end;
    }
  }

  if (!checkInDate || !checkOutDate) {
    checkInDate = new Date(Date.UTC(2024, 9, 24));
    checkOutDate = new Date(Date.UTC(2024, 9, 26));
  }

  const nightsComputed = Math.max(
    1,
    Math.round((+checkOutDate - +checkInDate) / 86400000),
  );

  const nights =
    Number.isFinite(nightsFallback) && nightsFallback > 0
      ? nightsFallback
      : nightsComputed;

  return { checkInDate, checkOutDate, nights };
}

function formatViBookingDate(date) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  } catch {
    return '';
  }
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('slug');
  const context = useMemo(() => parseBookingContext(searchParams), [searchParams]);
  const bookingBackHref = context.property && context.branch
    ? buildUrl('/booking', context)
    : getDiscoveryHref(context, { focus: 'search' });

  const [payment, setPayment] = useState('card');
  const guestsKey = parseGuestsParam(searchParams.get('guests'));

  /** Mặc định từ hồ sơ; khi nhập tay, dùng cùng state `contactDraft`. */
  const [profileLocked, setProfileLocked] = useState(true);
  const [contactDraft, setContactDraft] = useState(() => readProfileContact());

  /** Khi khóa theo hồ sơ, luôn đọc bản lưu mới nhất (sau “Lưu” ở /profile). */
  const profileFromStore = readProfileContact();

  const [note, setNote] = useState('');
  const [voucherDraft, setVoucherDraft] = useState('');
  const [appliedCode, setAppliedCode] = useState(null);

  const nightsParsed = Number.parseInt(searchParams.get('nights') || '', 10);
  const nightsFromQuery =
    Number.isFinite(nightsParsed) && nightsParsed > 0 ? nightsParsed : null;

  const { checkInDate, checkOutDate, nights } = checkoutDates(
    searchParams,
    nightsFromQuery,
    context,
  );

  const detail = slug ? resolveRoomDetail(slug) : null;
  const bookingRow = slug ? MOCK_ROOMS.find((r) => r.detailSlug === slug) : null;

  const heroImage =
    bookingRow?.image || detail?.gallery?.[0] || STITCH_CHECKOUT_IMG;

  const roomTitle = (() => {
    if (detail?.title) return detail.title;
    if (bookingRow?.code && bookingRow?.description)
      return `${bookingRow.code} · ${bookingRow.description.slice(0, 52)}`;
    return 'Phòng Deluxe Garden View';
  })();

  const guestLine = GUEST_LABEL[guestsKey];

  const pricePerNight =
    detail?.priceVnd ?? bookingRow?.priceVnd ?? 2_100_000;

  const pricing = useMemo(() => {
    const roomSubtotal = pricePerNight * nights;
    const serviceFee = Math.round(roomSubtotal * 0.1);
    let discountAmt = 210_000;
    if (appliedCode === 'CHERRYVIP') discountAmt = Math.round(roomSubtotal * 0.07);
    else if (appliedCode === 'CHERRY10') discountAmt = Math.round(roomSubtotal * 0.05);
    const totalVal = Math.max(0, roomSubtotal + serviceFee - discountAmt);
    return {
      serviceFee,
      discountAmt,
      totalVal,
      subtotalFormatted: fmtMoneyCompact(roomSubtotal),
      discountFormatted: `-${fmtMoneyCompact(discountAmt)}`,
    };
  }, [pricePerNight, nights, appliedCode]);

  const checkInFmt = formatViBookingDate(checkInDate);
  const checkOutFmt = formatViBookingDate(checkOutDate);

  function applyPromo(e) {
    e.preventDefault();
    const trimmed = voucherDraft.trim().toUpperCase();
    if (!trimmed) {
      setAppliedCode(null);
      return;
    }
    if (PROMO_OK.includes(trimmed)) {
      setAppliedCode(trimmed);
    } else {
      alert('Mã không hợp lệ trong bản demo. Dùng CHERRY10 hoặc CHERRYVIP.');
    }
  }

  function handleConfirm() {
    console.info('[demo] Checkout', {
      slug,
      nights,
      payment,
      voucher: appliedCode,
      guestLine,
      bookingContact: profileLocked ? profileFromStore : contactDraft,
      summaryLockedToProfile: profileLocked,
      total: pricing.totalVal,
    });
    alert('Đã ghi nhận yêu cầu (demo). Sau này bạn có thể nối API thanh toán tại đây.');
  }

  return (
    <div className="bg-surface pb-24 font-body text-sm selection:bg-primary-fixed selection:text-on-primary-fixed">
      <main className={[LAYOUT_CONTAINER, 'pt-24 pb-14 md:pt-28'].join(' ')}>
        <BookingProgress current="checkout" />
        <header className="mb-8 md:mb-10">
          <nav className="mb-3 flex flex-wrap items-center gap-x-2 text-xs text-on-surface-variant">
            <Link to={bookingBackHref} className="font-semibold text-primary hover:underline">
              Bảng phòng
            </Link>
            <span aria-hidden>/</span>
            <span>Đặt phòng &amp; thanh toán</span>
          </nav>
          <h1 className="mb-3 font-headline text-2xl font-bold tracking-tight text-primary md:text-3xl">
            Hoàn tất đặt phòng
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            Chỉ một bước nữa để bắt đầu kỳ nghỉ dưỡng tuyệt vời tại Cherry House. Vui lòng kiểm tra
            lại thông tin bên dưới.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-10 lg:col-span-7">
            <section aria-labelledby="checkout-guest">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container font-headline text-sm font-bold text-on-primary-container">
                  1
                </span>
                <h2 id="checkout-guest" className="font-headline text-lg font-bold text-on-surface md:text-xl">
                  Thông tin khách hàng
                </h2>
              </div>
              {profileLocked ? (
                <div className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-on-surface-variant">
                      Đang dùng thông tin trong{' '}
                      <Link to="/profile" className="font-semibold text-primary hover:underline">
                        hồ sơ của bạn
                      </Link>
                      .
                    </p>
                  </div>
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant/80">
                        Họ và tên
                      </dt>
                      <dd className="mt-1 font-semibold text-on-surface">{profileFromStore.fullName}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant/80">
                        Số điện thoại
                      </dt>
                      <dd className="mt-1 font-semibold text-on-surface">{profileFromStore.phone}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant/80">
                        Email
                      </dt>
                      <dd className="mt-1 break-all font-semibold text-on-surface">{profileFromStore.email}</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => {
                      setContactDraft(readProfileContact());
                      setProfileLocked(false);
                    }}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-transparent py-2.5 font-headline text-xs font-bold text-primary shadow-sm transition-colors hover:bg-primary/5 sm:w-auto sm:px-5"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    Nhập tay thông tin đặt phòng
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-on-surface-variant">
                    Đặt chỗ cho ai đó khác? Chỉnh sửa bên dưới hoặc lấy lại từ hồ sơ.
                  </p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1.5 md:col-span-1">
                      <span className="px-1 text-xs font-semibold text-on-surface-variant">Họ và tên</span>
                      <input
                        type="text"
                        value={contactDraft.fullName}
                        onChange={(e) =>
                          setContactDraft((c) => ({
                            ...c,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder="Nguyễn Văn A"
                        className="rounded-xl border-none bg-surface-container-high px-3 py-2.5 text-sm text-on-surface transition-all outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/30"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 md:col-span-1">
                      <span className="px-1 text-xs font-semibold text-on-surface-variant">Số điện thoại</span>
                      <input
                        type="tel"
                        value={contactDraft.phone}
                        onChange={(e) =>
                          setContactDraft((c) => ({
                            ...c,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="090 123 4567"
                        className="rounded-xl border-none bg-surface-container-high px-3 py-2.5 text-sm text-on-surface transition-all outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/30"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 md:col-span-2">
                      <span className="px-1 text-xs font-semibold text-on-surface-variant">Địa chỉ email</span>
                      <input
                        type="email"
                        value={contactDraft.email}
                        onChange={(e) =>
                          setContactDraft((c) => ({
                            ...c,
                            email: e.target.value,
                          }))
                        }
                        placeholder="example@cherryhouse.com"
                        className="rounded-xl border-none bg-surface-container-high px-3 py-2.5 text-sm text-on-surface transition-all outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/30"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setContactDraft(readProfileContact());
                      setProfileLocked(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Dùng lại thông tin từ hồ sơ
                  </button>
                </div>
              )}
              <label className="mt-6 flex flex-col gap-1.5">
                <span className="px-1 text-xs font-semibold text-on-surface-variant">
                  Yêu cầu đặc biệt (không bắt buộc)
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: Phòng tầng cao, nôi cho em bé..."
                  className="resize-y rounded-xl border-none bg-surface-container-high px-3 py-2.5 text-sm text-on-surface transition-all outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/30"
                />
              </label>
            </section>

            <section aria-labelledby="checkout-pay">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container font-headline text-sm font-bold text-on-primary-container">
                  2
                </span>
                <h2 id="checkout-pay" className="font-headline text-lg font-bold text-on-surface md:text-xl">
                  Phương thức thanh toán
                </h2>
              </div>

              <div className="space-y-3" role="radiogroup" aria-label="Chọn cổng thanh toán">
                {PAY_OPTIONS.map((opt) => {
                  const selected = payment === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={[
                        'relative flex cursor-pointer items-center rounded-xl border border-transparent bg-surface-container-lowest p-4 transition-all hover:bg-surface-container-low',
                        selected ? 'border-primary/20 bg-surface-container-low' : '',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={selected}
                        className="sr-only"
                        onChange={() => setPayment(opt.id)}
                      />
                      <div className="flex flex-1 items-center gap-3">
                        <span className="material-symbols-outlined scale-105 text-xl text-primary">{opt.icon}</span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-on-surface">{opt.title}</span>
                          <span className="text-xs text-on-surface-variant">{opt.subtitle}</span>
                        </div>
                      </div>
                      <div
                        className={[
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-outline-variant transition-all',
                          selected ? 'border-primary bg-primary' : '',
                        ].join(' ')}
                        aria-hidden
                      >
                        {selected ? <span className="block h-2 w-2 rounded-full bg-white" /> : null}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_32px_64px_-12px_rgba(28,28,25,0.06)]">
              <div className="relative h-48 w-full bg-surface-container-high">
                <img
                  src={heroImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/60 to-transparent p-5">
                  <h3 className="font-headline text-base font-bold text-white">{roomTitle}</h3>
                </div>
              </div>
              <div className="space-y-5 p-5 md:p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase opacity-65">
                      Ngày đến
                    </span>
                    <p className="font-headline text-sm font-bold text-on-surface">{checkInFmt}</p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase opacity-65">
                      Ngày đi
                    </span>
                    <p className="font-headline text-sm font-bold text-on-surface">{checkOutFmt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 border-y border-outline-variant/10 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-high">
                    <span className="material-symbols-outlined text-lg text-primary">person</span>
                  </div>
                  <span className="text-sm font-medium">{guestLine}</span>
                </div>

                <div className="flex flex-col gap-2 py-1">
                  <label className="px-1 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase opacity-65">
                    Mã ưu đãi
                  </label>
                  <form className="flex gap-2" onSubmit={applyPromo}>
                    <input
                      type="text"
                      value={voucherDraft}
                      onChange={(e) => setVoucherDraft(e.target.value)}
                      placeholder="Nhập mã ưu đãi..."
                      className="flex-1 rounded-xl border-none bg-surface-container-high px-3 py-2 text-xs font-body text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/30"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-xl bg-primary-container px-4 py-2 font-headline text-xs font-bold text-on-primary-container transition-colors hover:bg-primary hover:text-on-primary active:scale-95"
                    >
                      Áp dụng
                    </button>
                  </form>
                  {appliedCode ? (
                    <p className="text-xs font-semibold text-tertiary">
                      Đã áp dụng: <span className="uppercase">{appliedCode}</span>
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 text-xs text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Giá phòng ({nights} đêm)</span>
                    <span>{pricing.subtotalFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí dịch vụ & Thuế</span>
                    <span>{fmtMoneyCompact(pricing.serviceFee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-tertiary">
                    <span>
                      Ưu đãi{' '}
                      {appliedCode ? `(${appliedCode})` : 'thành viên'}
                    </span>
                    <span>{pricing.discountFormatted}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between border-t border-outline-variant/10 pt-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase opacity-65">
                      Tổng cộng
                    </span>
                    <span className="text-xs italic text-on-surface-variant">(Đã bao gồm thuế)</span>
                  </div>
                  <div className="font-headline text-xl font-bold text-primary md:text-2xl">
                    {fmtMoneyCompact(pricing.totalVal)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="active:scale-[0.98] w-full rounded-full bg-primary py-3.5 font-headline text-sm font-bold text-on-primary shadow-[0_20px_40px_-6px_rgba(168,46,66,0.18)] transition-transform"
                >
                  XÁC NHẬN ĐẶT PHÒNG
                </button>
                <p className="px-2 text-center text-[11px] leading-snug text-on-surface-variant">
                  Bằng cách nhấn nút, bạn đồng ý với{' '}
                  <a className="underline" href="#">
                    Điều khoản &amp; Điều kiện
                  </a>{' '}
                  và{' '}
                  <a className="underline" href="#">
                    Chính sách bảo mật
                  </a>{' '}
                  của Cherry House.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-6 opacity-40" aria-hidden>
              <span className="material-symbols-outlined">verified_user</span>
              <span className="material-symbols-outlined">lock</span>
              <span className="material-symbols-outlined">shield</span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
