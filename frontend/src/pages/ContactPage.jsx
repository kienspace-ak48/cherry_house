import { useState } from 'react';
import { Link } from 'react-router-dom';
import contactApi from '../api/contactApi';
import { LAYOUT_CONTAINER } from '../constants/layoutContainer';
import { getHeaderBookingHref } from '../lib/bookingContext';

/** Cùng địa chỉ với phần "Thông tin" — đổi query khi có địa chỉ thật */
const MAP_ADDRESS_QUERY = encodeURIComponent(
  '123 Đường Hoa Anh Đào, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
);
const GOOGLE_MAPS_EMBED_SRC = `https://maps.google.com/maps?q=${MAP_ADDRESS_QUERY}&z=15&output=embed&hl=vi`;
const GOOGLE_MAPS_EXTERNAL_HREF = `https://www.google.com/maps/search/?api=1&query=${MAP_ADDRESS_QUERY}`;

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const bookingHref = getHeaderBookingHref();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const fullName = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();

    setSubmitting(true);
    setSubmitError(null);

    try {
      await contactApi.submit({ fullName, email, message });
      setSent(true);
      form.reset();
    } catch (err) {
      setSubmitError(err?.message || 'Không gửi được tin nhắn. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh] bg-surface pb-20">
      <div className={[LAYOUT_CONTAINER, 'pt-24 md:pt-28'].join(' ')}>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold tracking-wide text-primary uppercase">
          <span className="material-symbols-outlined text-base">mail</span>
          Liên hệ
        </div>
        <h1 className="font-headline text-3xl font-bold text-on-surface md:text-4xl">
          Liên hệ chuỗi Cherry House
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          Hỗ trợ đặt phòng tại Đà Lạt, Vũng Tàu, Đà Nẵng và các cơ sở mới — hoặc góp ý về trải nghiệm
          tại từng chi nhánh.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="font-headline text-sm font-bold tracking-widest text-on-surface uppercase">
                Thông tin
              </h2>
              <ul className="mt-6 space-y-5 text-on-surface-variant">
                <li className="flex gap-4">
                  <span className="material-symbols-outlined shrink-0 text-primary">location_on</span>
                  <div>
                    <p className="text-xs font-bold tracking-wide text-on-surface uppercase">Trụ sở vận hành</p>
                    <p className="mt-1 text-sm leading-relaxed">
                      Văn phòng thương hiệu — hỗ trợ đa cơ sở<br />
                      Hotline &amp; email dùng chung cho mọi chi nhánh
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="material-symbols-outlined shrink-0 text-primary">call</span>
                  <div>
                    <p className="text-xs font-bold tracking-wide text-on-surface uppercase">Điện thoại</p>
                    <a
                      href="tel:+842812345678"
                      className="mt-1 block text-sm font-semibold text-primary hover:underline"
                    >
                      +84 28 1234 5678
                    </a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="material-symbols-outlined shrink-0 text-primary">mail</span>
                  <div>
                    <p className="text-xs font-bold tracking-wide text-on-surface uppercase">Email</p>
                    <a
                      href="mailto:hello@cherryhouse.vn"
                      className="mt-1 block text-sm font-semibold text-primary hover:underline"
                    >
                      hello@cherryhouse.vn
                    </a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="material-symbols-outlined shrink-0 text-primary">schedule</span>
                  <div>
                    <p className="text-xs font-bold tracking-wide text-on-surface uppercase">Giờ hỗ trợ</p>
                    <p className="mt-1 text-sm">8:00 – 22:00 hằng ngày (host từng chi nhánh 24/7)</p>
                  </div>
                </li>
              </ul>
            </div>
            <p className="text-sm text-on-surface-variant">
              <Link to={bookingHref} className="font-bold text-primary hover:underline">
                Bắt đầu đặt phòng
              </Link>
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm md:p-8">
            <h2 className="font-headline text-lg font-bold text-on-surface">Gửi tin nhắn</h2>
            {sent ? (
              <p className="mt-6 rounded-xl bg-primary/5 p-4 text-sm text-on-surface-variant">
                Cảm ơn bạn — Cherry House đã nhận tin nhắn và sẽ phản hồi qua email trong thời gian sớm nhất.
              </p>
            ) : (
              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                {submitError ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                    {submitError}
                  </p>
                ) : null}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                    Họ và tên
                  </label>
                  <input
                    required
                    name="name"
                    type="text"
                    autoComplete="name"
                    className="w-full rounded-xl border border-black/10 bg-surface px-4 py-3 text-sm text-on-surface"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                    Email
                  </label>
                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-xl border border-black/10 bg-surface px-4 py-3 text-sm text-on-surface"
                    placeholder="ban@email.com"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                    Nội dung
                  </label>
                  <textarea
                    required
                    name="message"
                    rows={5}
                    className="w-full resize-y rounded-xl border border-black/10 bg-surface px-4 py-3 text-sm text-on-surface"
                    placeholder="Bạn cần hỗ trợ điều gì?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Đang gửi…' : 'Gửi liên hệ'}
                </button>
              </form>
            )}
          </div>
        </div>

        <section className="mt-14 md:mt-16" aria-labelledby="contact-map-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="contact-map-heading" className="font-headline text-lg font-bold text-on-surface">
              Bản đồ
            </h2>
            <a
              href={GOOGLE_MAPS_EXTERNAL_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            >
              Mở trong Google Maps
              <span className="material-symbols-outlined text-lg">open_in_new</span>
            </a>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="aspect-21/9 min-h-[220px] w-full sm:min-h-[280px] md:aspect-video">
              <iframe
                title="Cherry House trên Google Maps"
                src={GOOGLE_MAPS_EMBED_SRC}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ContactPage;
