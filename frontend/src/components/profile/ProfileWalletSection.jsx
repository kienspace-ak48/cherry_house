import { useEffect, useState } from 'react';
import walletApi from '../../api/walletApi';

const TX_LABELS = {
  refund: 'Hoàn tiền hủy phòng',
  pay_booking: 'Thanh toán đặt phòng',
  admin_adjust: 'Điều chỉnh admin',
};

function fmtMoney(amountVnd) {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amountVnd))}đ`;
}

function fmtDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN');
}

export default function ProfileWalletSection() {
  const [state, setState] = useState({ loading: true, balanceVnd: 0, items: [], error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await walletApi.getSummary();
        if (!cancelled) {
          setState({
            loading: false,
            balanceVnd: data?.balanceVnd ?? 0,
            items: Array.isArray(data?.recentTransactions) ? data.recentTransactions : [],
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ loading: false, balanceVnd: 0, items: [], error: err?.message || 'Không tải được ví.' });
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (state.loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-outline-variant/30 bg-white">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-outline-variant/30 bg-linear-to-br from-primary/10 via-white to-secondary-container/40 p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Số dư ví Cherry House</p>
        <p className="mt-2 font-headline text-3xl font-bold text-primary">{fmtMoney(state.balanceVnd)}</p>
        <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
          Tiền hoàn từ hủy phòng (trước 24h) được cộng vào ví và dùng thanh toán đặt phòng tiếp theo.
        </p>
      </section>

      <section className="rounded-xl border border-tertiary/30 bg-tertiary/5 p-4 text-xs leading-relaxed text-on-surface">
        <p className="font-bold text-tertiary">Chính sách hoàn tiền</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-on-surface-variant">
          <li>Hủy <strong>trước 24 giờ</strong> nhận phòng (14:00): hoàn <strong>100%</strong> vào ví.</li>
          <li>Hủy trong vòng 24 giờ: <strong>không hoàn tiền</strong>.</li>
          <li>Ví không rút ra ngân hàng — chỉ dùng đặt phòng trên Cherry House.</li>
        </ul>
      </section>

      {state.error ? (
        <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{state.error}</div>
      ) : null}

      <section className="rounded-xl border border-outline-variant/30 bg-white shadow-sm">
        <div className="border-b border-outline-variant/30 px-5 py-3">
          <h2 className="font-headline text-base font-bold text-on-surface">Lịch sử giao dịch</h2>
        </div>
        <div className="divide-y divide-outline-variant/20">
          {!state.items.length ? (
            <p className="px-5 py-8 text-center text-sm text-on-surface-variant">Chưa có giao dịch.</p>
          ) : (
            state.items.map((tx) => (
              <div key={tx.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                <div>
                  <p className="font-semibold text-on-surface">{TX_LABELS[tx.type] || tx.type}</p>
                  <p className="text-xs text-on-surface-variant">
                    {fmtDateTime(tx.createdAt)}
                    {tx.bookingCode ? ` · ${tx.bookingCode}` : ''}
                  </p>
                </div>
                <p className={`font-bold ${tx.amountVnd >= 0 ? 'text-primary' : 'text-error'}`}>
                  {tx.amountVnd >= 0 ? '+' : ''}{fmtMoney(tx.amountVnd)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
