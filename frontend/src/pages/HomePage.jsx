import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHomeHero } from '../api/homeHeroApi';
import { fetchHomeSections } from '../api/homePageApi';
import HomeAreasSection from '../components/home/HomeAreasSection';
import HomeHeroSection from '../components/home/HomeHeroSection';
import HomeKindsSection from '../components/home/HomeKindsSection';
import HomeNewsletterSection from '../components/home/HomeNewsletterSection';
import HomeReviewsSection from '../components/home/HomeReviewsSection';
import HomeStatsSection from '../components/home/HomeStatsSection';
import HomeWhySection from '../components/home/HomeWhySection';
import { resolveSearchDestination } from '../lib/bookingContext';

const DEFAULT_HERO = {
  quickCities: ['Đà Lạt', 'Đà Nẵng', 'Vũng Tàu', 'Hội An', 'Phú Quốc'],
  slides: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
      alt: 'Cherry House — homestay và mini stay trên khắp Việt Nam',
      badge: 'Website chính thức Cherry House',
      titleLine1: 'Trải nghiệm lưu trú',
      titleLine2: 'ấm áp trên khắp Việt Nam',
      description:
        'Homestay, mini stay và villa đồng bộ thương hiệu — tìm theo địa điểm, chọn chi nhánh phù hợp và đặt phòng trực tiếp.',
    },
  ],
  slideIntervalSec: 6,
  isEnabled: true,
};

const DEFAULT_HOME_SECTIONS = {
  statsEnabled: true,
  stats: [
    { value: '2,400+', label: 'Lượt đặt phòng thành công' },
    { value: '120+', label: 'Cơ sở đối tác' },
    { value: '4.8★', label: 'Đánh giá trung bình' },
    { value: '12', label: 'Điểm đến trên cả nước' },
  ],
  whyEnabled: true,
  whyEyebrow: 'TẠI SAO CHERRY HOUSE?',
  whyTitle: 'Đặt trực tiếp — luôn tốt hơn',
  whyDescription:
    'Không qua trung gian, giá hiển thị là giá thanh toán, hỗ trợ thực sự từ chủ cơ sở.',
  whyItems: [
    {
      number: '01',
      title: 'Giá minh bạch',
      description:
        'Xem giá phòng đầy đủ trước khi đặt — không có khoản phí nào được cộng vào lúc thanh toán.',
    },
    {
      number: '02',
      title: 'Nhiều chi nhánh',
      description:
        'Một cơ sở thường có nhiều điểm ở cùng khu vực — dễ chọn nơi gần bạn nhất.',
    },
    {
      number: '03',
      title: 'Đặt nhanh, tức thì',
      description:
        'Chọn ngày và phòng trong vài bước — xác nhận ngay, không cần chờ duyệt thủ công.',
    },
  ],
  areasEnabled: true,
  areasEyebrow: 'KHÁM PHÁ',
  areasTitle: 'Khu vực phổ biến',
  areasSeeAllLabel: 'Xem tất cả',
  areasSeeAllHref: '/booking',
  areas: [
    {
      title: 'Đà Lạt',
      subtitle: '38 cơ sở · Homestay & Villa',
      imageUrl:
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      priceFrom: 'từ 450K/đêm',
      filterCity: 'Đà Lạt',
      isFeatured: true,
      comingSoon: false,
    },
    {
      title: 'Vũng Tàu',
      subtitle: '24 cơ sở',
      imageUrl:
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      priceFrom: 'từ 380K',
      filterCity: 'Vũng Tàu',
      isFeatured: false,
      comingSoon: false,
    },
    {
      title: 'Đà Nẵng',
      subtitle: '31 cơ sở',
      imageUrl:
        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
      priceFrom: 'từ 520K',
      filterCity: 'Đà Nẵng',
      isFeatured: false,
      comingSoon: false,
    },
    {
      title: 'Phú Quốc',
      subtitle: '19 cơ sở',
      imageUrl:
        'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80',
      priceFrom: 'từ 680K',
      filterCity: 'Phú Quốc',
      isFeatured: false,
      comingSoon: false,
    },
  ],
  kindsEnabled: true,
  kindsEyebrow: 'LOẠI HÌNH',
  kindsTitle: 'Chọn kiểu lưu trú phù hợp',
  kindsDescription: 'Từ homestay ấm cúng đến villa riêng tư — đặt theo đúng nhu cầu.',
  kinds: [
    {
      kind: 'homestay',
      badge: 'PHỔ BIẾN NHẤT',
      countLabel: '64 cơ sở',
      imageUrl:
        'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80',
    },
    {
      kind: 'mini_hotel',
      badge: '',
      countLabel: '38 cơ sở',
      imageUrl:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    },
    {
      kind: 'villa',
      badge: 'CAO CẤP',
      countLabel: '22 cơ sở',
      imageUrl:
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    },
    {
      kind: 'serviced_apartment',
      badge: '',
      countLabel: '15 cơ sở',
      imageUrl:
        'https://images.unsplash.com/photo-1560448204-e02f11c45751?auto=format&fit=crop&w=800&q=80',
    },
  ],
  reviewsEnabled: true,
  reviewsEyebrow: 'ĐÁNH GIÁ TỪ KHÁCH THỰC',
  reviewsTitle: 'Họ đã nói gì về Cherry House?',
  reviews: [
    {
      quote:
        'Đặt phòng nhanh, giá y chang trên web, không bị hỏi thêm phí gì. Host phản hồi trong 10 phút — sẽ quay lại Cherry House.',
      name: 'Lan Nguyễn',
      meta: 'TP. Hồ Chí Minh · Đặt Homestay Đà Lạt',
      initials: 'LN',
      rating: 5,
    },
    {
      quote:
        'Villa rộng hơn ảnh rất nhiều. Lần đầu đặt qua Cherry House mà thấy tin tưởng hơn hẳn so với app trung gian.',
      name: 'Minh Tú',
      meta: 'Hà Nội · Đặt Villa Vũng Tàu',
      initials: 'MT',
      rating: 5,
    },
    {
      quote:
        'Giá tốt hơn 15% so với Booking.com cho cùng phòng. Cherry House là lựa chọn đầu tiên khi đi công tác.',
      name: 'Hoàng Kim',
      meta: 'Đà Nẵng · Đặt Mini Hotel Đà Nẵng',
      initials: 'HK',
      rating: 5,
    },
  ],
  newsletterEnabled: true,
  newsletterTitle: 'Nhận deal sớm nhất',
  newsletterDescription:
    'Giá ưu đãi và phòng trống mới nhất gửi thẳng vào hộp thư — mỗi tuần một lần, không spam.',
  newsletterPlaceholder: 'Email của bạn',
  newsletterButtonLabel: 'Đăng ký ngay',
  newsletterSuccessMessage: 'Cảm ơn bạn! Cherry House sẽ gửi ưu đãi vào email của bạn.',
};

function HomePage() {
  const navigate = useNavigate();
  const [heroConfig, setHeroConfig] = useState(null);
  const [homeSections, setHomeSections] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchHomeHero()
      .then((data) => {
        if (!cancelled && data) setHeroConfig(data);
      })
      .catch(() => {});
    fetchHomeSections()
      .then((data) => {
        if (!cancelled && data) setHomeSections(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const hero = heroConfig?.isEnabled !== false && heroConfig ? heroConfig : DEFAULT_HERO;
  const sections = homeSections ?? DEFAULT_HOME_SECTIONS;

  const handleSearch = (ctx) => {
    navigate(resolveSearchDestination(ctx));
  };

  return (
    <div className="bg-surface text-on-surface">
      <HomeHeroSection
        slides={hero.slides}
        quickCities={hero.quickCities}
        intervalSec={hero.slideIntervalSec}
        onSearch={handleSearch}
      />

      {sections.statsEnabled ? <HomeStatsSection stats={sections.stats} /> : null}

      {sections.whyEnabled ? (
        <HomeWhySection
          eyebrow={sections.whyEyebrow}
          title={sections.whyTitle}
          description={sections.whyDescription}
          items={sections.whyItems}
        />
      ) : null}

      {sections.areasEnabled ? (
        <HomeAreasSection
          eyebrow={sections.areasEyebrow}
          title={sections.areasTitle}
          seeAllLabel={sections.areasSeeAllLabel}
          seeAllHref={sections.areasSeeAllHref}
          areas={sections.areas}
        />
      ) : null}

      {sections.kindsEnabled ? (
        <HomeKindsSection
          eyebrow={sections.kindsEyebrow}
          title={sections.kindsTitle}
          description={sections.kindsDescription}
          items={sections.kinds}
        />
      ) : null}

      {sections.reviewsEnabled ? (
        <HomeReviewsSection
          eyebrow={sections.reviewsEyebrow}
          title={sections.reviewsTitle}
          items={sections.reviews}
        />
      ) : null}

      {sections.newsletterEnabled ? (
        <HomeNewsletterSection
          title={sections.newsletterTitle}
          description={sections.newsletterDescription}
          placeholder={sections.newsletterPlaceholder}
          buttonLabel={sections.newsletterButtonLabel}
          successMessage={sections.newsletterSuccessMessage}
        />
      ) : null}
    </div>
  );
}

export default HomePage;
