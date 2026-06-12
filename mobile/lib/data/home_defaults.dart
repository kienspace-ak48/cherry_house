import '../models/home_content.dart';

/// Mặc định khớp `frontend/src/pages/HomePage.jsx` — dùng khi API chưa tải / lỗi.
abstract final class HomeDefaults {
  static const hero = HomeHeroConfig(
    quickCities: ['Đà Lạt', 'Đà Nẵng', 'Vũng Tàu', 'Hội An', 'Phú Quốc'],
    slides: [
      HomeHeroSlide(
        imageUrl:
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
        alt: 'Cherry House — homestay và mini stay trên khắp Việt Nam',
        badge: 'Website chính thức Cherry House',
        titleLine1: 'Trải nghiệm lưu trú',
        titleLine2: 'ấm áp trên khắp Việt Nam',
        description:
            'Homestay, mini stay và villa đồng bộ thương hiệu — tìm theo địa điểm, chọn chi nhánh phù hợp và đặt phòng trực tiếp.',
      ),
    ],
    slideIntervalSec: 6,
  );

  static const sections = HomeSectionsConfig(
    stats: [
      HomeStatItem(value: '2,400+', label: 'Lượt đặt phòng thành công'),
      HomeStatItem(value: '120+', label: 'Cơ sở đối tác'),
      HomeStatItem(value: '4.8★', label: 'Đánh giá trung bình'),
      HomeStatItem(value: '12', label: 'Điểm đến trên cả nước'),
    ],
    whyEyebrow: 'TẠI SAO CHERRY HOUSE?',
    whyTitle: 'Đặt trực tiếp — luôn tốt hơn',
    whyDescription:
        'Không qua trung gian, giá hiển thị là giá thanh toán, hỗ trợ thực sự từ chủ cơ sở.',
    whyItems: [
      HomeWhyItem(
        number: '01',
        title: 'Giá minh bạch',
        description:
            'Xem giá phòng đầy đủ trước khi đặt — không có khoản phí nào được cộng vào lúc thanh toán.',
      ),
      HomeWhyItem(
        number: '02',
        title: 'Nhiều chi nhánh',
        description:
            'Một cơ sở thường có nhiều điểm ở cùng khu vực — dễ chọn nơi gần bạn nhất.',
      ),
      HomeWhyItem(
        number: '03',
        title: 'Đặt nhanh, tức thì',
        description:
            'Chọn ngày và phòng trong vài bước — xác nhận ngay, không cần chờ duyệt thủ công.',
      ),
    ],
    areasEyebrow: 'KHÁM PHÁ',
    areasTitle: 'Khu vực phổ biến',
    areas: [
      HomeAreaItem(
        title: 'Đà Lạt',
        subtitle: '38 cơ sở · Homestay & Villa',
        imageUrl:
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        priceFrom: 'từ 450K/đêm',
        filterCity: 'Đà Lạt',
        isFeatured: true,
      ),
      HomeAreaItem(
        title: 'Vũng Tàu',
        subtitle: '24 cơ sở',
        imageUrl:
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
        priceFrom: 'từ 380K',
        filterCity: 'Vũng Tàu',
      ),
      HomeAreaItem(
        title: 'Đà Nẵng',
        subtitle: '31 cơ sở',
        imageUrl:
            'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
        priceFrom: 'từ 520K',
        filterCity: 'Đà Nẵng',
      ),
      HomeAreaItem(
        title: 'Phú Quốc',
        subtitle: '19 cơ sở',
        imageUrl:
            'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80',
        priceFrom: 'từ 680K',
        filterCity: 'Phú Quốc',
      ),
    ],
    kindsEyebrow: 'LOẠI HÌNH',
    kindsTitle: 'Chọn kiểu lưu trú phù hợp',
    kindsDescription: 'Từ homestay ấm cúng đến villa riêng tư — đặt theo đúng nhu cầu.',
    kinds: [
      HomeKindItem(
        kind: 'homestay',
        badge: 'PHỔ BIẾN NHẤT',
        countLabel: '64 cơ sở',
        imageUrl:
            'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80',
      ),
      HomeKindItem(
        kind: 'mini_hotel',
        countLabel: '38 cơ sở',
        imageUrl:
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      ),
      HomeKindItem(
        kind: 'villa',
        badge: 'CAO CẤP',
        countLabel: '22 cơ sở',
        imageUrl:
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
      ),
      HomeKindItem(
        kind: 'serviced_apartment',
        countLabel: '15 cơ sở',
        imageUrl:
            'https://images.unsplash.com/photo-1560448204-e02f11c45751?auto=format&fit=crop&w=800&q=80',
      ),
    ],
    reviewsEyebrow: 'ĐÁNH GIÁ TỪ KHÁCH THỰC',
    reviewsTitle: 'Họ đã nói gì về Cherry House?',
    reviews: [
      HomeReviewItem(
        quote:
            'Đặt phòng nhanh, giá y chang trên web, không bị hỏi thêm phí gì. Host phản hồi trong 10 phút — sẽ quay lại Cherry House.',
        name: 'Lan Nguyễn',
        meta: 'TP. Hồ Chí Minh · Đặt Homestay Đà Lạt',
        initials: 'LN',
      ),
      HomeReviewItem(
        quote:
            'Villa rộng hơn ảnh rất nhiều. Lần đầu đặt qua Cherry House mà thấy tin tưởng hơn hẳn so với app trung gian.',
        name: 'Minh Tú',
        meta: 'Hà Nội · Đặt Villa Vũng Tàu',
        initials: 'MT',
      ),
      HomeReviewItem(
        quote:
            'Giá tốt hơn 15% so với Booking.com cho cùng phòng. Cherry House là lựa chọn đầu tiên khi đi công tác.',
        name: 'Hoàng Kim',
        meta: 'Đà Nẵng · Đặt Mini Hotel Đà Nẵng',
        initials: 'HK',
      ),
    ],
    newsletterTitle: 'Nhận deal sớm nhất',
    newsletterDescription:
        'Giá ưu đãi và phòng trống mới nhất gửi thẳng vào hộp thư — mỗi tuần một lần, không spam.',
    newsletterSuccessMessage: 'Cảm ơn bạn! Cherry House sẽ gửi ưu đãi vào email của bạn.',
  );
}
