/**
 * Chi tiết phòng theo slug — khớp với MOCK_ROOMS trong bookingData (bookingRoomId = id danh sách đặt phòng).
 * @typedef {{ slug: string, bookingRoomId: number|null, badge: string, title: string, areaSqm: number, bedLabel: string, capacityLabel: string, paragraphs: string[], amenities: { icon: string, label: string }[], policyBullets: string[], checkIn: string, checkOut: string, priceVnd: number, gallery: string[] }} RoomDetailRecord
 */

const IMG = {
  deluxeLobby:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBw4flQn7skFzyHN1U6KCo2l2iyc1cR_umVcmDdnhUl8ye2f_Uu9VFmOfdz_-tIse-mEcnYOW_X9xgDKqtuRWkQXh3BDGexBj3v78143FCtYkZu_eUOnw_pBFSO_tDuKu9YDkk9aUdpNYWxCwTLPmg1BKN8Q7IDXqILsbvm9fgdqCAdp9q4YRmAtoj41rvnGXLNPU-T50Z449Khgk3OTh4v6kOc8Bhu7n8suVVm8k7Dmb4AHzWujIkCFdMPUWdruYhO8uGX4T3bYA',
  deluxeBed:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDlpDLaZDcEZ7VyiI4DibkzDdvLBXzE5IeFbbsc6zpTaKLDq1Nhb3lydjeXTYIwW35YctrsTOA-AT4LzGIP3CH2-Sb1NI5iNWeopBhz1kPC-yCMYCo5mZBQq8x6-cLQ3o79uR10ngCUXE5tgofTPH8ap07J7vb-yh7MOfDDySRy_rJseOJqz3bHSBe8sr8SJErSEXh6wF77c1dXbGUxKMCy18lGh2N99aJ14vFuK-6czMoMtFsc3ugUNHe5v74pra37viEcgEwrEg',
  stdMain:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDkJB8lH490-8fPyvIMbnE5oJLbI0cWD6effb7TssYOHXif_nzvDeF1KfhiKJRGeh3PY93ufHacAxSzHpqmnp5v5uHD5vIeR07P2Xjwwjl4pTBs3GsQq6r9cmthS9fdhy4YoQgxAOPxDBDm_ebJ-VtDA5yTLF-89jowMr49D4RFE5tGBhb61eX8kzRZmAQk4P3JuY_ddGoBxBzF6asfhIgLOkz05eX1QucMAn5bQGgRZIUY9gYd8YWe3HHS9Dl4r8Wy-s5_HpGLAw',
  suiteLiving:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC64gQmhwzdUSkPXHbKabI7BvGpDR813Jw_6gn1_5QXQ0t0_zPpopTC_GJuHlLUlJ1YHpCt2EXhd3hAu4JwlrcyqYCImjngFxWDIL4BrZmnO5VoQ6p7TJ_ARlAZbZRvl326bltGLnrsUQ66dXMjB5qabasvw_8mZRjq2yFJS-t8fzQ-RW0sKnRgxLZZOm7nES4mRhGUa3xksWNL_z86SkWHqFL6yl6bNuyrJJb4-T_5tPPfkgR0pHTfFDuE_dbiJeq0xrNxWCI8AA',
  penthouse:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuANsD8XDA6qYE7OrEoJntoADSCAFFVx5liI2F4uk1NideegT92mjQPAXk_cMQAUMCLL8mbf3LkJ5SWiLWn4sDjuFiC8CHWYCx1ugyDwspaqoJadFGvhzOMT5Yul8_znQ89reEU4joF4PLgcVCxsbHW_oj_2CLw6gALRX9l8Ijuwm5qjMJJ_tgt47cjDASHpCfbyHRmIAfDRGWkCW10KfO2qDlCTgRqtqaD323NXqOqN7WhoZQ_i2dOeSe_5rQeKoSKzrAbSo0asAA',
};

const STANDARD_AMENITIES = [
  { icon: 'wifi', label: 'Wi-Fi tốc độ cao' },
  { icon: 'coffee', label: 'Trà & cà phê chào đón' },
  { icon: 'ac_unit', label: 'Điều hòa độc lập' },
  { icon: 'lock', label: 'Két an toàn trong phòng' },
];

const STANDARD_POLICY = [
  'Hủy miễn phí trước 48 giờ so với ngày nhận phòng (theo điều kiện mùa lễ có thể thay đổi).',
  'Đặt cọc 30% được giữ khi hủy đúng hạn.',
  'Thay đổi ngày lưu trú tùy tình trạng phòng — Quầy lễ tân Cherry House luôn sẵn sàng.',
];

/** @type {Record<string, RoomDetailRecord>} */
const BY_SLUG = {
  'std-101': {
    slug: 'std-101',
    bookingRoomId: 1,
    badge: 'Standard · City Retreat',
    title: 'Standard — Phòng cổ điển gọn nhẹ',
    areaSqm: 28,
    bedLabel: 'Giường Queen',
    capacityLabel: 'Tối đa 2 khách',
    priceVnd: 1_590_000,
    checkIn: '14:00',
    checkOut: '12:00',
    gallery: [IMG.stdMain, IMG.deluxeLobby, IMG.deluxeBed, IMG.suiteLiving],
    paragraphs: [
      'Phòng Standard tại Cherry House được thiết kế tối giản nhưng ấm cúng, phù hợp khách đi công tác hay nghỉ ngắn ngày giữa lòng đô thị.',
      'Tất cả phòng đều có cửa sổ thoáng, nệm được chọn lọc cho giấc ngủ êm và ánh đèn vàng nhẹ nhàng tái tạo không gian nghỉ đúng chất boutique.',
    ],
    amenities: [...STANDARD_AMENITIES],
    policyBullets: [...STANDARD_POLICY],
  },
  'std-102': {
    slug: 'std-102',
    bookingRoomId: 2,
    badge: 'Standard · Quiet Wing',
    title: 'Standard — Cánh phòng yên tĩnh',
    areaSqm: 28,
    bedLabel: 'Giường Queen',
    capacityLabel: 'Tối đa 2 khách',
    priceVnd: 1_690_000,
    checkIn: '14:00',
    checkOut: '12:00',
    gallery: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9ad703b?auto=format&fit=crop&w=900&q=80',
      IMG.deluxeLobby,
      IMG.stdMain,
      IMG.deluxeBed,
    ],
    paragraphs: [
      'Tọa lại tầng thấp xa thang máy, phòng thích hợp cho khách cần không gian tĩnh lặng và bàn làm việc gọn trong phòng.',
      'Đội concierge có thể sắp xếp dịch vụ giặt nhanh, đưa đón sân bay hoặc chỗ đỗ xe theo yêu cầu.',
    ],
    amenities: [...STANDARD_AMENITIES],
    policyBullets: [...STANDARD_POLICY],
  },
  'deluxe-city-view': {
    slug: 'deluxe-city-view',
    bookingRoomId: 3,
    badge: 'Deluxe Signature',
    title: 'Deluxe City View',
    areaSqm: 42,
    bedLabel: 'Giường King',
    capacityLabel: 'Tối đa 3 khách',
    priceVnd: 2_790_000,
    checkIn: '14:00',
    checkOut: '12:00',
    gallery: [IMG.deluxeLobby, IMG.deluxeBed, IMG.stdMain, IMG.suiteLiving],
    paragraphs: [
      'Deluxe City View mở ra ban công kính với nhịp điệu thành phố vào buổi tối, kết hợp pallet màu ấm cherry và đá marble tinh giản.',
      'Minibar được tuyển chọn chai nước suối và snack đặc trưng; phòng tắm có vòi sen mưa và đồ dùng bọt tắm cao cấp.',
      'Đây là một trong các hạng được yêu thích nhất của khách cặp đôi và gia nhỏ trong chuyến nghỉ trung hạn.',
    ],
    amenities: [
      ...STANDARD_AMENITIES,
      { icon: 'king_bed', label: 'Giường King lót topper' },
      { icon: 'balcony', label: 'Ban công có ghế chờ đọc sách' },
      { icon: 'bathtub', label: 'Khu vệ sinh có vòi sen mưa' },
    ],
    policyBullets: [...STANDARD_POLICY],
  },
  'deluxe-panorama-205': {
    slug: 'deluxe-panorama-205',
    bookingRoomId: 4,
    badge: 'Deluxe · Góc Panorama',
    title: 'Deluxe Panorama Corner',
    areaSqm: 45,
    bedLabel: 'Giường King',
    capacityLabel: 'Tối đa 3 khách',
    priceVnd: 2_950_000,
    checkIn: '14:00',
    checkOut: '12:00',
    gallery: [IMG.deluxeBed, IMG.deluxeLobby, IMG.penthouse, IMG.suiteLiving],
    paragraphs: [
      'Phòng góc Panorama ôm trọn ánh sang ban mai — lựa chọn khi bạn mong muốn khung cửa rộng và không gian sống mở hơn chuẩn Deluxe.',
      'Độ cao giữ giúp căn phòng dịu hơn — kết nối hành lang riêng tới elevator suite cho trải nghiệm nghỉ dưỡng liền mạch.',
    ],
    amenities: [
      ...STANDARD_AMENITIES,
      { icon: 'window', label: 'Cửa sổ panorama kính hai lớp' },
      { icon: 'room_service', label: 'Room service Cherry House đến 22:00' },
    ],
    policyBullets: [...STANDARD_POLICY],
  },
  'deluxe-family-208': {
    slug: 'deluxe-family-208',
    bookingRoomId: 5,
    badge: 'Deluxe Family',
    title: 'Deluxe Family Connecting',
    areaSqm: 72,
    bedLabel: '2 giường Queen (kết nối communicating)',
    capacityLabel: 'Tối đa 4 khách',
    priceVnd: 3_200_000,
    checkIn: '14:00',
    checkOut: '12:00',
    gallery: [
      'https://images.unsplash.com/photo-1611892440504-42a792e54d34?auto=format&fit=crop&w=900&q=80',
      IMG.deluxeLobby,
      IMG.suiteLiving,
      IMG.deluxeBed,
    ],
    paragraphs: [
      'Hai phòng được nối nội bộ thích hợp gia đình có trẻ nhỏ, vẫn riêng tư khi khép cửa thông nhau.',
      'Tầng thấp gần hồ bơi và khu vui chơi trẻ em — được hưởng các quyền lợi gia đình theo điều kiện từng mùa.',
    ],
    amenities: [
      ...STANDARD_AMENITIES,
      { icon: 'door_front', label: 'Connecting door khóa an toàn' },
      { icon: 'iron', label: 'Bàn là & kệ để vali' },
    ],
    policyBullets: [...STANDARD_POLICY],
  },
  'cherry-suite': {
    slug: 'cherry-suite',
    bookingRoomId: 6,
    badge: 'Cherry Signature Suite',
    title: 'Cherry Suite — Salon & Retreat',
    areaSqm: 78,
    bedLabel: 'Giường King + Sofa giường',
    capacityLabel: 'Tối đa 4 khách',
    priceVnd: 4_990_000,
    checkIn: '14:00',
    checkOut: '12:00',
    gallery: [IMG.suiteLiving, IMG.deluxeLobby, IMG.deluxeBed, IMG.penthouse],
    paragraphs: [
      'Executive suite với salon tiếp khách tách khỏi khu vực đêm để không gian họp nhỏ hoặc thư giãn bằng whisky bar mini.',
      'Được hưởng quyền lợi Cherry Executive Lounge: buffet sáng hạng nhất, làm đẹp và check-in ruộ riêng khi có sẵn.',
      'Đội concierge “Cherry Assist” có thể sắp xếp spa in-room hoặc bàn hoa theo mong muốn.',
    ],
    amenities: [
      ...STANDARD_AMENITIES,
      { icon: 'weekend', label: 'Phòng khách độc lập có sofa và TV 65"' },
      { icon: 'microwave', label: 'Tủ mini bar được refill hai lần mỗi ngày' },
      { icon: 'elevator', label: 'Đưa đón cửa Exclusive (theo khung giờ)' },
      { icon: 'support_agent', label: 'Cherry concierge ưu tiên' },
    ],
    policyBullets: [
      'Hạng Suite / Penthouse có chính sách hủy riêng: vui lòng xác nhận khi nhận xác nhận đặt phòng.',
      ...STANDARD_POLICY,
    ],
  },
  'suite-grand-302': {
    slug: 'suite-grand-302',
    bookingRoomId: 7,
    badge: 'Suite Grand',
    title: 'Grand Suite — Spa Bath',
    areaSqm: 82,
    bedLabel: 'Giường King + phòng làm đôi WC',
    capacityLabel: 'Tối đa 4 khách',
    priceVnd: 5_350_000,
    checkIn: '14:00',
    checkOut: '12:00',
    gallery: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
      IMG.suiteLiving,
      IMG.deluxeBed,
      IMG.deluxeLobby,
    ],
    paragraphs: [
      'Thiết kế tách vùng sinh hoạt chung và phòng master với hai phòng tắm hạng sang, phù hợp cặp đôi thích không gian rộng hoặc gia có người thân đi kèm.',
      'Hệ âm thanh Bluetooth không dây, bàn makeup riêng và hệ chiếu sáng cảnh theo kiểu “editorial boutique”.',
    ],
    amenities: [
      ...STANDARD_AMENITIES,
      { icon: 'dry_cleaning', label: 'Áo choàng tắm dệt chỉ và dép suede' },
      { icon: 'hot_tub', label: 'Bồn tắm dài kèm tinh dầu thư giãn' },
    ],
    policyBullets: [
      'Hạng Suite / Penthouse có chính sách hủy riêng: vui lòng xác nhận khi nhận xác nhận đặt phòng.',
      ...STANDARD_POLICY,
    ],
  },
  'royal-penthouse': {
    slug: 'royal-penthouse',
    bookingRoomId: 8,
    badge: 'Royal Residence',
    title: 'Cherry Signature Royal Penthouse',
    areaSqm: 220,
    bedLabel: 'Giường King + lounge sofa',
    capacityLabel: 'Tối đa 6 khách',
    priceVnd: 12_900_000,
    checkIn: '15:00',
    checkOut: '11:00',
    gallery: [IMG.penthouse, IMG.suiteLiving, IMG.deluxeLobby, IMG.deluxeBed],
    paragraphs: [
      'Đỉnh của trải nghiệm Cherry House: sân hiên riêng, jacuzzi và bếp show kitchen phục vụ tiệc nhỏ dưới ánh skyline.',
      'Kính panorama 270° ôm một phần không gian sống, phòng họp trong nhà và dàn âm studio ẩn sau hệ cánh trượt veneer.',
      'Team butler chỉ định phối hợp limousine, chỗ VIP sân bay hoặc bàn Michelin partner theo mong muốn.',
    ],
    amenities: [
      ...STANDARD_AMENITIES,
      { icon: 'balcony', label: 'Sân thượng jacuzzi và lounge ngoài trời' },
      { icon: 'kitchen', label: 'Bếp show kitchen + minibar chủ đề rượu Cherry' },
      { icon: 'local_bar', label: 'Wine chiller và set ly pha lê' },
      { icon: 'fitness_center', label: 'Kết nối Gym & Spa private scheduling' },
    ],
    policyBullets: [
      'Penthouse yêu cầu đặt cọc 50%; hủy trong vòng 7 ngày trước nhận phòng có điều khoản phạt cụ thể gửi kèm hợp đồng.',
      'Nhận phòng và trả phòng linh hoạt theo thỏa thuận khi không full house.',
      ...STANDARD_POLICY.slice(0, 1),
    ],
  },
};

/**
 * @param {string | undefined} slug
 * @returns {RoomDetailRecord | null}
 */
export function resolveRoomDetail(slug) {
  if (!slug) return null;
  return BY_SLUG[slug] ?? null;
}
