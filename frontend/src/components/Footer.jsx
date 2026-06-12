import { Link } from 'react-router-dom';
import { LAYOUT_CONTAINER } from '../constants/layoutContainer';
import { getHeaderBookingHref } from '../lib/bookingContext';

function Footer() {
  const bookingHref = getHeaderBookingHref();
  return (
    <footer id="lien-he" className="w-full scroll-mt-28 bg-surface-container pt-16 pb-8">
      <div
        className={[
          LAYOUT_CONTAINER,
          'flex flex-col items-start justify-between gap-12 md:flex-row',
        ].join(' ')}
      >
        <div className="max-w-sm space-y-6">
          <span className="font-headline text-2xl font-bold text-primary">Cherry House</span>
          <p className="text-sm leading-relaxed text-stone-500">
            Chuỗi homestay &amp; mini stay tại Việt Nam — đặt phòng trực tiếp trên website thương hiệu, không
            qua sàn trung gian. Nhiều cơ sở, nhiều chi nhánh, một trải nghiệm ấm áp.
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined cursor-pointer text-primary">social_leaderboard</span>
            <span className="material-symbols-outlined cursor-pointer text-primary">retweet</span>
            <span className="material-symbols-outlined cursor-pointer text-primary">travel_explore</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="font-headline text-sm font-bold tracking-widest text-on-surface uppercase">
              Khám phá
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-sm text-stone-500 transition-colors hover:text-primary"
                  to={bookingHref}
                >
                  Đặt phòng
                </Link>
              </li>
              <li>
                <Link
                  className="text-sm text-stone-500 transition-colors hover:text-primary"
                  to="/about"
                >
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-headline text-sm font-bold tracking-widest text-on-surface uppercase">
              Pháp lý
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-sm text-stone-500 transition-colors hover:text-primary"
                  to="/privacy"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  className="text-sm text-stone-500 transition-colors hover:text-primary"
                  to="/terms"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        className={[
          LAYOUT_CONTAINER,
          'mt-16 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-8 md:flex-row',
        ].join(' ')}
      >
        <p className="text-sm text-stone-500">
          © {new Date().getFullYear()} Cherry House — Homestay &amp; Mini Stay Việt Nam.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
