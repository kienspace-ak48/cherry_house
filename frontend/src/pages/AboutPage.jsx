import { Link } from 'react-router-dom';
import { LAYOUT_CONTAINER } from '../constants/layoutContainer';
import { PROPERTIES } from '../data/properties';

function AboutPage() {
  return (
    <div className="bg-surface pb-20">
      <div className={[LAYOUT_CONTAINER, 'pt-24 md:pt-28'].join(' ')}>
        <p className="font-headline text-xs font-bold tracking-[0.2em] text-primary uppercase">
          Thương hiệu
        </p>
        <h1 className="mt-3 font-headline text-3xl font-extrabold text-on-surface md:text-4xl">
          Cherry House — Chuỗi lưu trú của bạn, không phải sàn OTA
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
          Cherry House sở hữu và vận hành nhiều cơ sở homestay, mini hotel, villa và căn hộ dịch vụ tại
          các tỉnh thành khác nhau. Khách đặt trực tiếp trên website chính thức: minh bạch giá, gắn với
          từng chi nhánh và từng phòng thật.
        </p>

        <section className="mt-14 rounded-2xl border border-black/5 bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-headline text-xl font-bold text-on-surface">Cấu trúc hệ thống</h2>
          <div className="mt-6 font-mono text-sm leading-relaxed text-on-surface-variant">
            <p className="font-semibold text-primary">Cherry House (Brand)</p>
            <p className="ml-4">├── Đà Lạt (Property)</p>
            <p className="ml-8">├── Chi nhánh Hồ Xuân Hương</p>
            <p className="ml-8">├── Chi nhánh Đồi Thông</p>
            <p className="ml-8">└── Chi nhánh Trung Tâm</p>
            <p className="ml-4">├── Vũng Tàu</p>
            <p className="ml-4">└── Đà Nẵng</p>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-on-surface-variant">
            Mỗi cơ sở có nhiều <strong className="text-on-surface">loại phòng</strong> (Standard, Deluxe,
            Family, Dorm…) và nhiều <strong className="text-on-surface">phòng</strong> cụ thể để đặt (A101,
            DL-05…).
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-headline text-xl font-bold text-on-surface">Các loại hình lưu trú</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { icon: 'cottage', title: 'Homestay', desc: 'Không gian ấm, gần gũi, host hỗ trợ' },
              { icon: 'apartment', title: 'Mini Hotel', desc: 'Phòng gọn, tiện nghi đủ dùng, dễ đặt ngắn ngày' },
              { icon: 'villa', title: 'Villa', desc: 'Nguyên căn cho nhóm, sân vườn & tiệc nhỏ' },
              {
                icon: 'domain',
                title: 'Serviced Apartment',
                desc: 'Bếp, giặt — phù hợp lưu trú dài ngày',
              },
            ].map((item) => (
              <li
                key={item.title}
                className="flex gap-4 rounded-xl border border-black/5 bg-surface-container-low/80 p-4"
              >
                <span className="material-symbols-outlined text-3xl text-primary">{item.icon}</span>
                <div>
                  <h3 className="font-headline font-bold text-on-surface">{item.title}</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-headline text-xl font-bold text-on-surface">Cơ sở hiện có</h2>
          <ul className="mt-6 space-y-3">
            {PROPERTIES.map((p) => (
              <li key={p.slug}>
                <Link
                  to={`/properties/${p.slug}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-black/5 bg-white px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <span className="font-semibold text-on-surface">{p.name}</span>
                  <span className="text-sm text-on-surface-variant">{p.kindLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/booking"
            className="mt-6 inline-flex items-center gap-1 font-bold text-primary hover:underline"
          >
            Xem tất cả cơ sở
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;
