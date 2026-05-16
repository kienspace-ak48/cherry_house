import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { LAYOUT_CONTAINER } from '../constants/layoutContainer';

const IMG = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB46N4gVdqMtHJt5y5SfzRJ7LGlY14me9PiNAgF3Chaet_LX03hK5BdX1GUFDyspTd1Vh69BeDxCF1J_-Z8fNcyKqv-PPeuVSISenigGRv76VonFLP5i9lzkQ2Nw7Gr0TE2UhGXKNjZ9lwaroGdk-xko0snVoPidEyg16Cr2mKoML6WVyc_qwTLdug0M8NYVZIXicCvZPa0KLeATfwcDXbggz26e4dXmjEMxclfT9kEPX_OSM7P-_A2hF9YJjdGtgIyW-1jwo6T3Q',
  introLobby:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBw4flQn7skFzyHN1U6KCo2l2iyc1cR_umVcmDdnhUl8ye2f_Uu9VFmOfdz_-tIse-mEcnYOW_X9xgDKqtuRWkQXh3BDGexBj3v78143FCtYkZu_eUOnw_pBFSO_tDuKu9YDkk9aUdpNYWxCwTLPmg1BKN8Q7IDXqILsbvm9fgdqCAdp9q4YRmAtoj41rvnGXLNPU-T50Z449Khgk3OTh4v6kOc8Bhu7n8suVVm8k7Dmb4AHzWujIkCFdMPUWdruYhO8uGX4T3bYA',
  introSuite:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDlpDLaZDcEZ7VyiI4DibkzDdvLBXzE5IeFbbsc6zpTaKLDq1Nhb3lydjeXTYIwW35YctrsTOA-AT4LzGIP3CH2-Sb1NI5iNWeopBhz1kPC-yCMYCo5mZBQq8x6-cLQ3o79uR10ngCUXE5tgofTPH8ap07J7vb-yh7MOfDDySRy_rJseOJqz3bHSBe8sr8SJErSEXh6wF77c1dXbGUxKMCy18lGh2N99aJ14vFuK-6czMoMtFsc3ugUNHe5v74pra37viEcgEwrEg',
  spa: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVaEMmMYOyjNCbjdnIqrHcnNT0z5YA68KtEHqWqype60udt1oWJZDmgzpeRemBrSph_paZBl6B9FXQeQyPDPNdZDATfW7aV9yR703GdQh8fBhc0SmpcE4ZcgCH0nqFzbHAn-gLlUZ6mGXt8kfr5Umd2Zipj05-Cly-HSPU-W80Lkp40Zoh105_3A64Iatz47eUSrOLd2FBZcxMixkNPSUxvfNqDzK8L6cuutQpVtch9uuMG_qR_bhikvmfFMF1QSn-fUNKirtzQg',
  pool: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQTv5UjvwrtlNX_wQPdd3CceVQs403txncElXbHUy2wY8lXlqmqbgqbP3oanoe00wQCBv-OlPOQEztW1STcQ7okFnTJ8e1mfK1XmRcJYSomjgacyhkyWuOSEJry93fq6rXg11WYy74jAXzVm8sQiZ0X9OHR55GoI5CGQSZSbXamJgKZc_4k3B0krJZwutsjFrrep-h15BN5GbFAPlgSa92HEav9rmBs9sIA-nixBc0VnSCrS6E7C9qU9R10f7Lj71Simz_cv2EAQ',
  ruby: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBJkaevA4a1HaoQBI0cohEcj4RBt-rkhVIvQd5W2wJYT2I8oiKYQQQod_v2dAS7ZePQ-tbKdwZNDAiFP9_viD8eBBF8yV_QlWi3YAf-h-seLujS_gSMULObwDc5BKy7EBGLiYISiJViFNjkJO6uVhcRi6CtdsMWDV2NdShkO_y_aCn47DmzqrHK2Pn04GT-abT4M2QQTkm_it4BnX6ahQR9ekSR4LRm9g_n-BYOjdn0tqxL3qCLhQiWzSUPct96g4_1w8sz6nnow',
  lounge:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDKAwarNRDhtwOVbDxaYzt5M4gSvt2RTsncBjRfnI862zObSgIm4Uc8StKGt32RJga4p_BeD2q5Gv7loQ3hAlMUNSWi_L4XN4LX51pkwbV3yaPybTW7JtgnIe-pxGXR4vaCoi9TrJyTDRtQSYgkP4Nq8S2IhbBtFHe5d53V5nyNEx4zqLLn9Y69RQUXNoZfVwqMstkLQfcOOv6sW9Dk_8Ayzbx72yOf3Bhij2cAbyIxo7umF-IDYYK7susjahD5ovwc5UOIsdPepg',
  roomDeluxe:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDkJB8lH490-8fPyvIMbnE5oJLbI0cWD6effb7TssYOHXif_nzvDeF1KfhiKJRGeh3PY93ufHacAxSzHpqmnp5v5uHD5vIeR07P2Xjwwjl4pTBs3GsQq6r9cmthS9fdhy4YoQgxAOPxDBDm_ebJ-VtDA5yTLF-89jowMr49D4RFE5tGBhb61eX8kzRZmAQk4P3JuY_ddGoBxBzF6asfhIgLOkz05eX1QucMAn5bQGgRZIUY9gYd8YWe3HHS9Dl4r8Wy-s5_HpGLAw',
  roomExec:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC64gQmhwzdUSkPXHbKabI7BvGpDR813Jw_6gn1_5QXQ0t0_zPpopTC_GJuHlLUlJ1YHpCt2EXhd3hAu4JwlrcyqYCImjngFxWDIL4BrZmnO5VoQ6p7TJ_ARlAZbZRvl326bltGLnrsUQ66dXMjB5qabasvw_8mZRjq2yFJS-t8fzQ-RW0sKnRgxLZZOm7nES4mRhGUa3xksWNL_z86SkWHqFL6yl6bNuyrJJb4-T_5tPPfkgR0pHTfFDuE_dbiJeq0xrNxWCI8AA',
  roomPenthouse:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuANsD8XDA6qYE7OrEoJntoADSCAFFVx5liI2F4uk1NideegT92mjQPAXk_cMQAUMCLL8mbf3LkJ5SWiLWn4sDjuFiC8CHWYCx1ugyDwspaqoJadFGvhzOMT5Yul8_znQ89reEU4joF4PLgcVCxsbHW_oj_2CLw6gALRX9l8Ijuwm5qjMJJ_tgt47cjDASHpCfbyHRmIAfDRGWkCW10KfO2qDlCTgRqtqaD323NXqOqN7WhoZQ_i2dOeSe_5rQeKoSKzrAbSo0asAA',
};

function scrollRoomsScroller(ref, direction) {
  const el = ref.current;
  if (!el) return;
  const delta = Math.round(el.clientWidth * 0.55) || 320;
  el.scrollBy({ left: direction * delta, behavior: 'smooth' });
}

function HomePage() {
  const roomsScrollerRef = useRef(null);

  return (
    <div className="bg-surface text-on-surface">
      {/* Hero */}
      <section className="relative flex min-h-[max(560px,calc(100svh-4.25rem))] items-center justify-center overflow-hidden md:min-h-[max(700px,calc(100svh-4.75rem))]">
        <div className="absolute inset-0 z-0">
          <img
            className="h-full w-full object-cover"
            alt="Khách sạn Cherry House lúc hoàng hôn, kiến trúc sang trọn và khu vườn xanh"
            src={IMG.hero}
          />
          <div className="hero-home-gradient absolute inset-0" aria-hidden />
        </div>

        <div className={[LAYOUT_CONTAINER, 'relative z-10 text-center'].join(' ')}>
          <h1 className="mb-6 font-headline text-5xl leading-tight font-extrabold text-white md:text-7xl">
            Nơi Di Sản Gặp Gỡ <br />
            <span className="font-normal italic">Sự Sang Trọng</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-white/90 md:text-xl">
            Trải nghiệm kỳ nghỉ tinh tế trong không gian kiến trúc đương đại, nơi
            mọi giác quan được vỗ về bởi sự tĩnh lặng và đẳng cấp.
          </p>

          <div className="mx-auto flex max-w-5xl flex-col gap-2 rounded-xl border border-outline-variant/15 bg-white p-2 shadow-2xl md:flex-row md:items-center md:rounded-full">
            <div className="flex flex-1 flex-col items-start px-6 py-3 text-left">
              <label className="mb-1 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                Địa điểm
              </label>
              <div className="flex w-full items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  location_on
                </span>
                <input
                  className="w-full border-none bg-transparent p-0 font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0"
                  placeholder="Bạn muốn đi đâu?"
                  type="text"
                  aria-label="Địa điểm"
                />
              </div>
            </div>

            <div className="hidden h-10 w-px bg-surface-variant md:block" aria-hidden />

            <div className="flex flex-1 flex-col items-start px-6 py-3 text-left">
              <label className="mb-1 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                Ngày nhận phòng
              </label>
              <div className="flex w-full items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  calendar_today
                </span>
                <input
                  className="w-full border-none bg-transparent p-0 font-medium text-on-surface focus:ring-0"
                  type="date"
                  aria-label="Ngày nhận phòng"
                />
              </div>
            </div>

            <div className="hidden h-10 w-px bg-surface-variant md:block" aria-hidden />

            <div className="flex flex-1 flex-col items-start px-6 py-3 text-left">
              <label className="mb-1 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                Ngày trả phòng
              </label>
              <div className="flex w-full items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  event_busy
                </span>
                <input
                  className="w-full border-none bg-transparent p-0 font-medium text-on-surface focus:ring-0"
                  type="date"
                  aria-label="Ngày trả phòng"
                />
              </div>
            </div>

            <Link
              to="/booking"
              className="rounded-xl bg-primary px-10 py-4 text-center font-headline text-sm font-bold tracking-widest text-on-primary uppercase transition-all hover:bg-primary-container active:scale-95 md:rounded-full"
            >
              Tìm Kiếm
            </Link>
          </div>
        </div>
      </section>

      {/* Về Cherry House */}
      <section
        className={[
          LAYOUT_CONTAINER,
          'grid grid-cols-1 items-center gap-12 py-24 md:grid-cols-12',
        ].join(' ')}
      >
        <div className="space-y-6 md:col-span-5">
          <span className="font-headline text-sm font-bold tracking-[0.2em] text-primary uppercase">
            Về Cherry House
          </span>
          <h2 className="font-headline text-4xl leading-tight font-bold text-on-surface">
            Tuyệt tác kiến trúc giữa lòng thành phố
          </h2>
          <p className="text-lg leading-relaxed text-on-surface-variant">
            Cherry House không chỉ là một khách sạn, mà là một không gian nghệ thuật
            sống động. Chúng tôi kết hợp tinh hoa văn hóa địa phương với tiêu
            chuẩn dịch vụ quốc tế để tạo ra những khoảnh khắc đáng nhớ nhất cho
            mỗi vị khách.
          </p>
          <div className="pt-4">
            <Link
              to="/about"
              className="group inline-flex items-center gap-2 font-headline text-xs font-bold tracking-widest text-primary uppercase"
            >
              Khám phá câu chuyện của chúng tôi
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                arrow_right_alt
              </span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:col-span-7">
          <div className="pt-12">
            <img
              className="h-[400px] w-full rounded-2xl object-cover shadow-xl"
              alt="Sảnh khách sạn hiện đại với đại sảnh thoáng đãng và ánh sáng dịu"
              src={IMG.introLobby}
            />
          </div>
          <div>
            <img
              className="h-[400px] w-full rounded-2xl object-cover shadow-xl"
              alt="Suite cao cấp với giường king và ánh đèn ấm"
              src={IMG.introSuite}
            />
          </div>
        </div>
      </section>

      {/* Dịch vụ */}
      <section id="dich-vu" className="scroll-mt-28 bg-surface-container-low py-24">
        <div className={LAYOUT_CONTAINER}>
          <div className="mb-16 space-y-4 text-center">
            <h2 className="font-headline text-4xl font-extrabold text-on-surface">
              Dịch Vụ Đặc Quyền
            </h2>
            <p className="mx-auto max-w-xl text-on-surface-variant">
              Nâng tầm trải nghiệm nghỉ dưỡng với những dịch vụ được thiết kế riêng
              cho phong cách sống thượng lưu.
            </p>
          </div>

          <div className="grid h-auto grid-cols-1 gap-6 md:grid-cols-3 md:h-[600px]">
            <article className="group relative overflow-hidden rounded-3xl border border-outline-variant/10 bg-white shadow-sm md:col-span-1 md:row-span-2">
              <img
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Spa Sakura yên bình"
                src={IMG.spa}
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-primary/80 to-transparent p-8">
                <h3 className="mb-2 font-headline text-2xl font-bold text-white">
                  Sakura Spa
                </h3>
                <p className="mb-4 text-sm text-white/80">
                  Liệu pháp thư giãn thuần khiết từ thảo mộc thiên nhiên.
                </p>
                <span className="flex items-center gap-2 text-xs font-bold tracking-widest text-white uppercase">
                  Tìm hiểu thêm{' '}
                  <span className="material-symbols-outlined text-sm">north_east</span>
                </span>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-3xl border border-outline-variant/10 bg-white shadow-sm md:col-span-2">
              <img
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Hồ bơi vô cực"
                src={IMG.pool}
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-on-surface/60 to-transparent p-8">
                <h3 className="mb-2 font-headline text-2xl font-bold text-white">
                  Infinity Pool
                </h3>
                <p className="mb-4 text-sm text-white/80">
                  Hồ bơi vô cực ngắm nhìn toàn cảnh thành phố từ trên cao.
                </p>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-3xl border border-outline-variant/10 bg-white shadow-sm">
              <img
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Nhà hàng Ruby sang trọn"
                src={IMG.ruby}
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-primary/80 to-transparent p-8">
                <h3 className="mb-2 font-headline text-xl font-bold text-white">
                  Ruby Restaurant
                </h3>
                <p className="mb-2 text-xs text-white/80">
                  Ẩm thực Fusion tinh tế.
                </p>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-3xl border border-outline-variant/10 bg-white shadow-sm">
              <img
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Executive Lounge"
                src={IMG.lounge}
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-on-surface/60 to-transparent p-8">
                <h3 className="mb-2 font-headline text-xl font-bold text-white">
                  Executive Lounge
                </h3>
                <p className="mb-2 text-xs text-white/80">
                  Không gian làm việc riêng tư.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Phòng — cùng LAYOUT_CONTAINER với header / các khối khác; carousel cuộn trong max-w-7xl */}
      <section id="phong-noi-bat" className="scroll-mt-28 bg-surface py-24">
        <div className={LAYOUT_CONTAINER}>
          <div className="mb-12 flex items-end justify-between gap-4">
            <div className="space-y-4">
              <span className="font-headline text-sm font-bold tracking-[0.2em] text-primary uppercase">
                Phòng & Suites
              </span>
              <h2 className="font-headline text-4xl font-extrabold text-on-surface">
                Không Gian Nghỉ Dưỡng
              </h2>
            </div>
            <div className="hidden gap-4 md:flex">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant text-on-surface transition-all hover:border-primary hover:bg-primary hover:text-white"
                aria-label="Cuộn danh sách phòng sang trái"
                onClick={() => scrollRoomsScroller(roomsScrollerRef, -1)}
              >
                <span className="material-symbols-outlined">west</span>
              </button>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant text-on-surface transition-all hover:border-primary hover:bg-primary hover:text-white"
                aria-label="Cuộn danh sách phòng sang phải"
                onClick={() => scrollRoomsScroller(roomsScrollerRef, 1)}
              >
                <span className="material-symbols-outlined">east</span>
              </button>
            </div>
          </div>

          <div
            ref={roomsScrollerRef}
            className="no-scrollbar flex gap-8 overflow-x-auto pb-12"
            tabIndex={0}
          >
          {[
            {
              title: 'Deluxe King Room',
              subtitle: 'Diện tích: 45m² • Hướng thành phố',
              price: '3.500k',
              badge: 'Phổ biến nhất',
              img: IMG.roomDeluxe,
              alt: 'Phòng Deluxe King hiện đại',
            },
            {
              title: 'Executive Suite',
              subtitle: 'Diện tích: 75m² • Hướng hồ bơi',
              price: '5.200k',
              img: IMG.roomExec,
              alt: 'Executive Suite thoáng sáng',
            },
            {
              title: 'Cherry Signature Penthouse',
              subtitle: 'Diện tích: 120m² • Toàn cảnh thành phố',
              price: '12.000k',
              img: IMG.roomPenthouse,
              alt: 'Penthouse panorama',
            },
          ].map((room) => (
            <article
              key={room.title}
              className="min-w-[320px] shrink-0 group md:min-w-[450px]"
            >
              <div className="relative mb-6 overflow-hidden rounded-2xl">
                <img
                  className="aspect-4/5 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={room.alt}
                  src={room.img}
                />
                {room.badge ? (
                  <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold tracking-widest text-primary uppercase backdrop-blur">
                    {room.badge}
                  </div>
                ) : null}
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="mb-1 font-headline text-xl font-bold text-on-surface">
                    {room.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant">{room.subtitle}</p>
                </div>
                <div className="text-right">
                  <span className="font-headline text-xl font-extrabold text-primary">
                    {room.price}
                  </span>
                  <span className="block text-xs font-bold text-on-surface-variant uppercase">
                    / Đêm
                  </span>
                </div>
              </div>
            </article>
          ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24">
        <div className={LAYOUT_CONTAINER}>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[3rem] bg-surface-container-high p-12 text-center md:p-20">
            <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/5 blur-3xl" aria-hidden />
            <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-primary/5 blur-3xl" aria-hidden />
            <div className="relative z-10 space-y-8">
              <h2 className="font-headline text-3xl leading-tight font-extrabold text-on-surface md:text-5xl">
                Gia nhập cộng đồng <br /> thành viên của chúng tôi
              </h2>
              <p className="mx-auto max-w-lg text-on-surface-variant">
                Đăng ký để nhận thông tin về các chương trình ưu đãi đặc quyền và những
                câu chuyện thú vị từ Cherry House.
              </p>
              <form
                className="mx-auto flex max-w-md flex-col gap-4 md:flex-row"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  className="flex-1 rounded-full border border-outline-variant/30 bg-white px-6 py-4 outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
                  placeholder="Email của bạn"
                  type="email"
                  name="newsletter-email"
                  autoComplete="email"
                />
                <button
                  type="submit"
                  className="rounded-full bg-primary px-10 py-4 font-headline text-sm font-bold tracking-widest text-on-primary uppercase shadow-lg transition-all hover:bg-primary-container"
                >
                  Đăng ký
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
