import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import checkoutApi from '../../api/checkoutApi';
import BookingProgress from '../../components/booking/BookingProgress';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';
import { parseBookingContext } from '../../lib/bookingContext';

function fmtMoney(amountVnd) {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amountVnd))}đ`;
}

/** Chỉ gửi vnp_* lên backend — tham số khác (bookingCode) làm fail checksum */
function buildVnpayQuery(searchParams) {
  const q = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith('vnp_')) q[key] = value;
  });
  return q;
}

const MOMO_QUERY_KEYS = [
  'partnerCode',
  'orderId',
  'requestId',
  'amount',
  'orderInfo',
  'orderType',
  'transId',
  'resultCode',
  'message',
  'payType',
  'responseTime',
  'extraData',
  'signature',
];

function buildMomoQuery(searchParams) {
  const q = {};
  for (const key of MOMO_QUERY_KEYS) {
    const value = searchParams.get(key);
    if (value != null && value !== '') q[key] = value;
  }
  return q;
}

export default function CheckoutResultPage() {
  const [searchParams] = useSearchParams();
  const context = useMemo(() => parseBookingContext(searchParams), [searchParams]);
  const bookingCode =
    searchParams.get('bookingCode')
    || searchParams.get('orderId')
    || searchParams.get('vnp_TxnRef')
    || '';
  const paymentFlag = searchParams.get('payment') || '';

  const vnpayQuery = useMemo(() => buildVnpayQuery(searchParams), [searchParams]);
  const momoQuery = useMemo(() => buildMomoQuery(searchParams), [searchParams]);
  const hasVnpayParams = Object.keys(vnpayQuery).length > 0;
  const hasMomoParams = Boolean(momoQuery.partnerCode && momoQuery.resultCode != null);
  const vnpResponseCode = vnpayQuery.vnp_ResponseCode || '';
  const momoResultCode = momoQuery.resultCode || '';

  const [status, setStatus] = useState({ loading: true, data: null, error: null });
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    if (!bookingCode) {
      setStatus({ loading: false, data: null, error: 'Thiếu mã đặt phòng.' });
      return undefined;
    }

    let cancelled = false;

    async function load() {
      try {
        if (hasVnpayParams) {
          const verified = await checkoutApi.verifyVnpay(vnpayQuery);
          if (!cancelled) setVerifyResult(verified);
        } else if (hasMomoParams) {
          const verified = await checkoutApi.verifyMomo(momoQuery);
          if (!cancelled) setVerifyResult(verified);
        }
        const data = await checkoutApi.getStatus(bookingCode);
        if (!cancelled) {
          setStatus({ loading: false, data, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setStatus({
            loading: false,
            data: null,
            error: err?.message || 'Không tải được trạng thái đơn.',
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [bookingCode, hasVnpayParams, hasMomoParams, vnpayQuery, momoQuery]);

  const isPaid =
    status.data?.status === 'confirmed' || status.data?.payment?.status === 'paid';
  const isPending = status.data?.status === 'pending_payment';
  const isCancelled = paymentFlag === 'cancel';

  const gatewaySucceeded =
    verifyResult?.isVerified === true && verifyResult?.isSuccess === true;
  const gatewayFailed =
    verifyResult?.isVerified === true && verifyResult?.isSuccess === false;
  const showSuccess = isPaid || gatewaySucceeded;
  const showFailure =
    gatewayFailed
    || paymentFlag === 'error'
    || (hasVnpayParams && vnpResponseCode && vnpResponseCode !== '00' && !gatewaySucceeded)
    || (hasMomoParams && momoResultCode && momoResultCode !== '0' && !gatewaySucceeded);

  return (
    <div className="bg-surface pb-24 font-body text-sm">
      <main className={[LAYOUT_CONTAINER, 'pt-24 pb-14 md:pt-28'].join(' ')}>
        <BookingProgress current="checkout" context={context} />

        <div className="mx-auto max-w-lg rounded-2xl bg-surface-container-lowest p-6 shadow-sm md:p-8">
          {status.loading ? (
            <p className="text-center text-on-surface-variant">Đang xác nhận thanh toán...</p>
          ) : null}

          {!status.loading && status.error ? (
            <div className="text-center">
              <span className="material-symbols-outlined mb-2 text-4xl text-error">error</span>
              <h1 className="font-headline text-xl font-bold text-error">Có lỗi</h1>
              <p className="mt-2 text-on-surface-variant">{status.error}</p>
            </div>
          ) : null}

          {!status.loading && !status.error && showSuccess ? (
            <div className="text-center">
              <span className="material-symbols-outlined mb-2 text-4xl text-tertiary">check_circle</span>
              <h1 className="font-headline text-xl font-bold text-tertiary">Thanh toán thành công</h1>
              <p className="mt-2 text-on-surface-variant">
                Mã đặt phòng: <strong>{status.data?.bookingCode || bookingCode}</strong>
              </p>
              {status.data?.totalVnd ? (
                <p className="mt-1 text-sm">Tổng: {fmtMoney(status.data.totalVnd)}</p>
              ) : null}
              {verifyResult?.message ? (
                <p className="mt-2 text-xs text-on-surface-variant">{verifyResult.message}</p>
              ) : null}
              {status.data?.qrCodeDataUrl ? (
                <div className="mx-auto mt-6 max-w-xs rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                    Mã QR check-in
                  </p>
                  <img
                    src={status.data.qrCodeDataUrl}
                    alt={`QR đặt phòng ${status.data?.bookingCode || bookingCode}`}
                    className="mx-auto mt-3 h-44 w-44 rounded-xl border border-outline-variant/20 bg-white p-2"
                  />
                  <p className="mt-3 text-xs text-on-surface-variant">
                    Xuất trình mã QR hoặc mã đặt phòng tại lễ tân khi nhận phòng.
                  </p>
                </div>
              ) : null}
              <p className="mt-3 text-xs text-on-surface-variant">
                Cherry House đã ghi nhận thanh toán. Email xác nhận kèm mã QR sẽ được gửi đến bạn.
              </p>
            </div>
          ) : null}

          {!status.loading && !status.error && !showSuccess && showFailure ? (
            <div className="text-center">
              <span className="material-symbols-outlined mb-2 text-4xl text-error">cancel</span>
              <h1 className="font-headline text-xl font-bold text-on-surface">Thanh toán thất bại</h1>
              <p className="mt-2 text-on-surface-variant">
                Mã đơn: <strong>{bookingCode}</strong>
              </p>
              {verifyResult?.message ? (
                <p className="mt-1 text-sm text-on-surface-variant">{verifyResult.message}</p>
              ) : (
                <p className="mt-1 text-sm text-on-surface-variant">
                  Giao dịch chưa hoàn tất. Bạn có thể quay lại checkout và thử lại.
                </p>
              )}
            </div>
          ) : null}

          {!status.loading && !status.error && !showSuccess && !showFailure && isPending ? (
            <div className="text-center">
              <span className="material-symbols-outlined mb-2 animate-pulse text-4xl text-primary">
                hourglass_top
              </span>
              <h1 className="font-headline text-xl font-bold text-on-surface">
                {isCancelled ? 'Đã hủy thanh toán' : 'Đang chờ thanh toán'}
              </h1>
              <p className="mt-2 text-on-surface-variant">
                Mã giữ chỗ: <strong>{status.data?.bookingCode}</strong>
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                {isCancelled
                  ? 'Bạn đã hủy trên cổng thanh toán. Đơn vẫn được giữ tạm — có thể thanh toán lại.'
                  : 'Nếu đã thanh toán, vui lòng đợi vài giây hoặc tải lại trang.'}
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {showFailure ? (
              <Link
                to="/booking"
                className="rounded-full bg-primary px-5 py-2.5 text-center font-headline text-sm font-bold text-on-primary"
              >
                Thử thanh toán lại
              </Link>
            ) : (
              <Link
                to="/booking"
                className="rounded-full bg-primary px-5 py-2.5 text-center font-headline text-sm font-bold text-on-primary"
              >
                Về trang đặt phòng
              </Link>
            )}
            <Link
              to="/"
              className="rounded-full border border-outline-variant/30 px-5 py-2.5 text-center font-headline text-sm font-semibold text-on-surface"
            >
              Trang chủ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
