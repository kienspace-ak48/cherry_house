import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import bookingApi from '../../api/bookingApi';
import checkoutApi from '../../api/checkoutApi';
import promoApi from '../../api/promoApi';
import walletApi from '../../api/walletApi';
import { submitSepayForm } from '../../lib/submitSepayForm';
import BookingBreadcrumbs from '../../components/booking/BookingBreadcrumbs';
import BookingProgress from '../../components/booking/BookingProgress';
import DateRangePicker from '../../components/booking/DateRangePicker';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';
import { readProfileContact, syncProfileContactFromUser } from '../../data/profileContact';
import { isClientLoggedIn } from '../../lib/authStorage';
import { refreshClientProfile } from '../../api/authApi';
import { resolveBranch } from '../../data/properties';
import {
  buildUrl,
  getBookingStepHref,
  parseBookingContext,
} from '../../lib/bookingContext';
import { countNights } from '../../lib/dateRange';
import { MOCK_ROOMS } from '../booking/bookingData';
import { resolveRoomDetail } from '../../data/roomDetails';
import { STITCH_CHECKOUT_IMG } from './checkoutDefaults';

const GUEST_LABEL = {
  '2-adults-0-children': '2 Người lớn, 0 Trẻ em',
  '2-adults-1-child': '2 Người lớn, 1 Trẻ em',
  '1-adult-0-children': '1 Người lớn',
};

/**
 * Phương thức thanh toán:
 * - card → VNPay
 * - momo → cổng MoMo, nhập thẻ (payWithATM / payWithCC theo cấu hình backend)
 */
const PAY_OPTIONS = [
  {
    id: 'card',
    icon: 'credit_card',
    title: 'Thẻ / ATM qua VNPay',
    subtitle: 'Visa, Mastercard, JCB, thẻ ATM nội địa',
  },
  {
    id: 'momo',
    icon: 'account_balance',
    title: 'Thẻ ATM qua MoMo',
    subtitle: 'Nhập số thẻ Napas trên cổng thanh toán MoMo',
  },
];

const WALLET_PAY_OPTION = {
  id: 'cherry_wallet',
  icon: 'account_balance_wallet',
  title: 'Ví Cherry House',
  subtitle: 'Thanh toán bằng số dư ví nội bộ',
};

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

  // Không dùng ngày giả khi chưa chọn — pricing chờ user chọn trên picker

  const nightsComputed =
    checkInDate && checkOutDate
      ? Math.max(1, Math.round((+checkOutDate - +checkInDate) / 86400000))
      : 0;

  const nights =
    Number.isFinite(nightsFallback) && nightsFallback > 0
      ? nightsFallback
      : nightsComputed || 1;

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

function formatConflictRange(conflict) {
  if (!conflict?.checkIn || !conflict?.checkOut) return '';
  const inFmt = formatViBookingDate(new Date(`${conflict.checkIn}T12:00:00`));
  const outFmt = formatViBookingDate(new Date(`${conflict.checkOut}T12:00:00`));
  return `${inFmt} – ${outFmt}`;
}

export default function CheckoutPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const slug = searchParams.get('slug');
  const guestsKey = parseGuestsParam(searchParams.get('guests'));
  const context = useMemo(() => parseBookingContext(searchParams), [searchParams]);
  const progressExtra = useMemo(
    () => ({ slug: slug || undefined, guests: guestsKey }),
    [slug, guestsKey],
  );
  const branchCtx = useMemo(
    () => (context.property && context.branch
      ? resolveBranch(context.property, context.branch)
      : null),
    [context.property, context.branch],
  );
  const bookingBackHref = buildUrl('/booking', context);

  const [payment, setPayment] = useState('card');

  /** Mặc định từ hồ sơ; khi nhập tay, dùng cùng state `contactDraft`. */
  const [profileLocked, setProfileLocked] = useState(true);
  const [contactDraft, setContactDraft] = useState(() => readProfileContact());

  /** Khi khóa theo hồ sơ, luôn đọc bản lưu mới nhất (sau “Lưu” ở /profile). */
  const profileFromStore = readProfileContact();

  const [note, setNote] = useState('');
  const [availability, setAvailability] = useState({
    status: 'idle',
    data: null,
    error: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [wallet, setWallet] = useState({ loading: false, balanceVnd: null, error: null });

  const loggedIn = isClientLoggedIn();
  const payOptions = useMemo(
    () => (loggedIn ? [...PAY_OPTIONS, WALLET_PAY_OPTION] : PAY_OPTIONS),
    [loggedIn],
  );

  const checkInIso = searchParams.get('checkIn') || context.checkIn || '';
  const checkOutIso = searchParams.get('checkOut') || context.checkOut || '';

  /** Đã đăng nhập → lấy họ tên / email / SĐT từ tài khoản (không dùng demo). */
  useEffect(() => {
    if (!isClientLoggedIn()) return undefined;
    let cancelled = false;
    refreshClientProfile()
      .then((user) => {
        if (cancelled || !user) return;
        const contact = syncProfileContactFromUser(user);
        setContactDraft(contact);
        setProfileLocked(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      setWallet({ loading: false, balanceVnd: null, error: null });
      if (payment === 'cherry_wallet') setPayment('card');
      return undefined;
    }

    let cancelled = false;
    setWallet((w) => ({ ...w, loading: true, error: null }));
    walletApi
      .getSummary()
      .then((data) => {
        if (!cancelled) {
          setWallet({
            loading: false,
            balanceVnd: Number(data?.balanceVnd) || 0,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setWallet({
            loading: false,
            balanceVnd: null,
            error: err?.message || 'Không tải được số dư ví.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  /** Đồng bộ ngày từ URL context (trang chủ → booking → checkout) */
  useEffect(() => {
    if (!context.checkIn || !context.checkOut) return undefined;
    if (searchParams.get('checkIn') && searchParams.get('checkOut')) return undefined;

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('checkIn', context.checkIn);
        next.set('checkOut', context.checkOut);
        const nightsCount = countNights(context.checkIn, context.checkOut);
        if (nightsCount > 0) next.set('nights', String(nightsCount));
        return next;
      },
      { replace: true },
    );
    return undefined;
  }, [context.checkIn, context.checkOut, setSearchParams]);

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

  /** Giá/đêm từ DB (API check-availability trả về room.priceVnd). */
  const pricePerNight = availability.data?.room?.priceVnd ?? 0;

  const pricing = useMemo(() => {
    const roomSubtotal = pricePerNight * nights;
    const discountVal = appliedPromo?.discountVnd ?? 0;
    const totalVal = appliedPromo?.totalVnd ?? roomSubtotal;
    return {
      subtotalVal: roomSubtotal,
      discountVal,
      totalVal,
      subtotalFormatted: fmtMoneyCompact(roomSubtotal),
      discountFormatted: discountVal ? fmtMoneyCompact(discountVal) : null,
      pricePerNightFormatted: fmtMoneyCompact(pricePerNight),
    };
  }, [pricePerNight, nights, appliedPromo]);

  const checkInFmt = formatViBookingDate(checkInDate);
  const checkOutFmt = formatViBookingDate(checkOutDate);

  const walletInsufficient =
    payment === 'cherry_wallet'
    && wallet.balanceVnd != null
    && wallet.balanceVnd < pricing.totalVal;

  const canConfirm =
    availability.status === 'available'
    && Boolean(checkInIso && checkOutIso && slug && context.property && context.branch)
    && (payment !== 'cherry_wallet' || (wallet.balanceVnd != null && !walletInsufficient));

  function handleDateChange({ checkIn, checkOut }) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (checkIn) next.set('checkIn', checkIn);
        else next.delete('checkIn');
        if (checkOut) next.set('checkOut', checkOut);
        else next.delete('checkOut');
        const nightsCount = countNights(checkIn ?? '', checkOut ?? '');
        if (nightsCount > 0) next.set('nights', String(nightsCount));
        else next.delete('nights');
        return next;
      },
      { replace: true },
    );
  }

  useEffect(() => {
    if (!checkInIso || !checkOutIso || !slug || !context.property || !context.branch) {
      setAvailability({ status: 'idle', data: null, error: null });
      return undefined;
    }

    let cancelled = false;
    setAvailability((prev) => ({ ...prev, status: 'checking', error: null }));

    bookingApi
      .checkAvailability({
        propertySlug: context.property,
        branchCode: context.branch,
        detailSlug: slug,
        checkIn: checkInIso,
        checkOut: checkOutIso,
      })
      .then((data) => {
        if (cancelled) return;
        setAvailability({
          status: data.available ? 'available' : 'unavailable',
          data,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setAvailability({
          status: 'error',
          data: null,
          error: err?.message || 'Không kiểm tra được phòng. Vui lòng thử lại.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [checkInIso, checkOutIso, slug, context.property, context.branch]);

  useEffect(() => {
    setAppliedPromo(null);
    setPromoError(null);
  }, [checkInIso, checkOutIso, slug, context.property, context.branch, pricePerNight, nights]);

  async function handleApplyPromo() {
    const code = promoInput.trim();
    if (!code) {
      setPromoError('Vui lòng nhập mã giảm giá.');
      setAppliedPromo(null);
      return;
    }
    if (!pricePerNight || nights < 1) {
      setPromoError('Chọn ngày nhận/trả phòng trước khi áp dụng mã.');
      return;
    }

    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await promoApi.validate(code, pricePerNight * nights);
      if (!res?.success || !res.data) {
        setAppliedPromo(null);
        setPromoError(res?.message || 'Mã không hợp lệ.');
        return;
      }
      setAppliedPromo(res.data);
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(err?.message || 'Không áp dụng được mã giảm giá.');
    } finally {
      setPromoLoading(false);
    }
  }

  function handleClearPromo() {
    setPromoInput('');
    setAppliedPromo(null);
    setPromoError(null);
  }

  async function handleConfirm() {
    if (!canConfirm || submitting) return;

    const contact = profileLocked ? profileFromStore : contactDraft;
    if (!contact.fullName?.trim() || !contact.phone?.trim() || !contact.email?.trim()) {
      setSubmitError('Vui lòng điền đầy đủ họ tên, số điện thoại và email.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await checkoutApi.startPay({
        propertySlug: context.property,
        branchCode: context.branch,
        detailSlug: slug,
        checkIn: checkInIso,
        checkOut: checkOutIso,
        guests: guestsKey,
        guestName: contact.fullName.trim(),
        guestPhone: contact.phone.trim(),
        guestEmail: contact.email.trim(),
        specialNote: note.trim() || undefined,
        promoCode: appliedPromo?.code || undefined,
        paymentMethod: payment,
      });

      if (result.action === 'redirect' && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }

      if (result.action === 'form' && result.sepay?.checkoutUrl) {
        submitSepayForm(result.sepay.checkoutUrl, result.sepay.fields);
        return;
      }

      if (result.action === 'qr' && result.qr?.dataUrl) {
        setQrModal({
          bookingCode: result.bookingCode,
          dataUrl: result.qr.dataUrl,
          amountVnd: result.amountVnd,
          expireMinutes: result.qr.expireMinutes ?? 15,
        });
        return;
      }

      if (result.action === 'confirmed' && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }

      setSubmitError('Không nhận được phản hồi thanh toán từ server.');
    } catch (err) {
      setSubmitError(err?.message || 'Không thể khởi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-surface pb-24 font-body text-sm selection:bg-primary-fixed selection:text-on-primary-fixed">
      <main className={[LAYOUT_CONTAINER, 'pt-24 pb-14 md:pt-28'].join(' ')}>
        <BookingProgress current="checkout" context={context} extra={progressExtra} />
        <header className="mb-8 md:mb-10">
          <BookingBreadcrumbs
            className="mb-3 text-xs"
            items={[
              { label: 'Tìm kiếm', href: getBookingStepHref('search', context) },
              { label: 'Cơ sở', href: getBookingStepHref('property', context) },
              branchCtx
                ? {
                    label: branchCtx.property.name,
                    href: getBookingStepHref('branch', context),
                  }
                : { label: 'Chi nhánh', href: getBookingStepHref('branch', context) },
              {
                label: branchCtx?.branch.name ?? 'Phòng',
                href: bookingBackHref,
              },
              { label: 'Thanh toán', current: true },
            ]}
          />
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
                {payOptions.map((opt) => {
                  const selected = payment === opt.id;
                  const isWallet = opt.id === 'cherry_wallet';
                  const walletDisabled =
                    isWallet
                    && (wallet.loading || wallet.balanceVnd == null || wallet.balanceVnd < pricing.totalVal);
                  return (
                    <label
                      key={opt.id}
                      className={[
                        'relative flex items-center rounded-xl border border-transparent bg-surface-container-lowest p-4 transition-all',
                        walletDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-surface-container-low',
                        selected ? 'border-primary/20 bg-surface-container-low' : '',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={selected}
                        className="sr-only"
                        disabled={walletDisabled}
                        onChange={() => setPayment(opt.id)}
                      />
                      <div className="flex flex-1 items-center gap-3">
                        <span className="material-symbols-outlined scale-105 text-xl text-primary">{opt.icon}</span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-on-surface">{opt.title}</span>
                          <span className="text-xs text-on-surface-variant">
                            {isWallet && wallet.balanceVnd != null
                              ? `Số dư: ${fmtMoneyCompact(wallet.balanceVnd)}`
                              : opt.subtitle}
                          </span>
                          {isWallet && walletInsufficient ? (
                            <span className="text-xs font-semibold text-error">
                              Không đủ số dư (cần {fmtMoneyCompact(pricing.totalVal)})
                            </span>
                          ) : null}
                          {isWallet && wallet.error ? (
                            <span className="text-xs text-error">{wallet.error}</span>
                          ) : null}
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
                <div className="space-y-2">
                  <DateRangePicker
                    checkIn={checkInIso}
                    checkOut={checkOutIso}
                    onChange={handleDateChange}
                    variant="default"
                    label="Ngày nhận – trả phòng"
                    placeholder="Chọn ngày nhận – trả phòng"
                    className="w-full"
                  />
                  {checkInIso && checkOutIso ? (
                    <p className="px-1 text-xs text-on-surface-variant">
                      {checkInFmt} → {checkOutFmt}
                      {nights > 0 ? ` · ${nights} đêm` : null}
                    </p>
                  ) : null}
                  {availability.status === 'checking' ? (
                    <p className="flex items-center gap-2 px-1 text-xs font-medium text-on-surface-variant">
                      <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                      Đang kiểm tra phòng...
                    </p>
                  ) : null}
                  {availability.status === 'available' ? (
                    <p className="flex items-center gap-1.5 px-1 text-xs font-semibold text-tertiary">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      Phòng còn trống trong khoảng ngày đã chọn
                    </p>
                  ) : null}
                  {availability.status === 'unavailable' ? (
                    <div className="rounded-xl bg-error-container/40 px-3 py-2 text-xs text-on-error-container">
                      <p className="font-semibold">
                        {availability.data?.message || 'Phòng không còn trống trong khoảng ngày này.'}
                      </p>
                      {availability.data?.conflicts?.length ? (
                        <ul className="mt-1 list-inside list-disc opacity-90">
                          {availability.data.conflicts.map((c) => (
                            <li key={c.bookingId}>
                              Đã đặt {formatConflictRange(c)}
                              {c.status === 'pending_payment' ? ' (đang giữ chỗ)' : ''}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                  {availability.status === 'error' ? (
                    <p className="rounded-xl bg-error-container/40 px-3 py-2 text-xs font-medium text-on-error-container">
                      {availability.error}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2.5 border-y border-outline-variant/10 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-high">
                    <span className="material-symbols-outlined text-lg text-primary">person</span>
                  </div>
                  <span className="text-sm font-medium">{guestLine}</span>
                </div>

                <div className="rounded-xl border border-outline-variant/15 bg-surface-container/40 p-3">
                  <label className="mb-2 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                    Mã giảm giá
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="VD: CHERRY10"
                      className="min-w-0 flex-1 rounded-lg border border-outline-variant/20 bg-white px-3 py-2 text-sm uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !pricePerNight || nights < 1}
                      className="shrink-0 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary disabled:opacity-50"
                    >
                      {promoLoading ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                  {appliedPromo ? (
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-room-available">
                        Đã áp dụng <code>{appliedPromo.code}</code>
                      </span>
                      <button
                        type="button"
                        onClick={handleClearPromo}
                        className="text-on-surface-variant underline"
                      >
                        Gỡ
                      </button>
                    </div>
                  ) : null}
                  {promoError ? (
                    <p className="mt-2 text-xs font-medium text-error">{promoError}</p>
                  ) : null}
                </div>

                <div className="space-y-2 text-xs text-on-surface-variant">
                  {pricePerNight > 0 ? (
                    <div className="flex justify-between">
                      <span>Giá phòng / đêm</span>
                      <span>{pricing.pricePerNightFormatted}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <span>
                      {nights > 0 ? `${nights} đêm` : 'Tổng tiền phòng'}
                    </span>
                    <span>
                      {pricePerNight > 0 && nights > 0
                        ? pricing.subtotalFormatted
                        : '—'}
                    </span>
                  </div>
                  {appliedPromo && pricing.discountVal > 0 ? (
                    <div className="flex justify-between font-medium text-room-available">
                      <span>Giảm giá ({appliedPromo.code})</span>
                      <span>-{pricing.discountFormatted}</span>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-end justify-between border-t border-outline-variant/10 pt-4">
                  <span className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase opacity-65">
                    Tổng thanh toán
                  </span>
                  <div className="font-headline text-xl font-bold text-primary md:text-2xl">
                    {pricePerNight > 0 && nights > 0
                      ? fmtMoneyCompact(pricing.totalVal)
                      : '—'}
                  </div>
                </div>
                {submitError ? (
                  <p className="rounded-xl bg-error-container/40 px-3 py-2 text-xs font-medium text-on-error-container">
                    {submitError}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!canConfirm || submitting}
                  className={[
                    'w-full rounded-full py-3.5 font-headline text-sm font-bold transition-transform',
                    canConfirm && !submitting
                      ? 'active:scale-[0.98] bg-primary text-on-primary shadow-[0_20px_40px_-6px_rgba(168,46,66,0.18)]'
                      : 'cursor-not-allowed bg-outline-variant/25 text-on-surface-variant',
                  ].join(' ')}
                >
                  {submitting
                    ? 'ĐANG XỬ LÝ...'
                    : availability.status === 'checking'
                      ? 'ĐANG KIỂM TRA...'
                      : 'XÁC NHẬN ĐẶT PHÒNG'}
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

      {qrModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 text-center shadow-xl">
            <h2 className="font-headline text-lg font-bold text-on-surface">Quét mã thanh toán</h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              Mã đơn: <strong>{qrModal.bookingCode}</strong>
            </p>
            <p className="text-sm font-semibold text-primary">
              {fmtMoneyCompact(qrModal.amountVnd)}
            </p>
            <img
              src={qrModal.dataUrl}
              alt="VNPay QR"
              className="mx-auto my-4 rounded-lg bg-white p-2"
              width={280}
              height={280}
            />
            <p className="text-xs text-on-surface-variant">
              Hết hạn sau {qrModal.expireMinutes} phút. Mở app ngân hàng để quét.
            </p>
            <Link
              to={`/checkout/result?bookingCode=${encodeURIComponent(qrModal.bookingCode)}`}
              className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 font-headline text-sm font-bold text-on-primary"
            >
              Đã thanh toán — xem kết quả
            </Link>
            <button
              type="button"
              onClick={() => setQrModal(null)}
              className="mt-3 block w-full text-sm text-on-surface-variant hover:text-on-surface"
            >
              Đóng
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
