/** Dữ liệu giả cho trang Booking / bảng trạng thái phòng */

export const MOCK_ROOMS = [
  {
    id: 1,
    detailSlug: 'std-101',
    code: 'STD-101',
    type: 'Standard',
    status: 'available',
    priceVnd: 1_590_000,
    capacityLabel: 'Tối đa 2 khách',
    description: 'Phòng tiêu chuẩn view nội khu, giường đôi, minibar và Wi-Fi tốc độ cao.',
    alt: 'Phòng Standard gọn gàng, ánh sáng tự nhiên',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkJB8lH490-8fPyvIMbnE5oJLbI0cWD6effb7TssYOHXif_nzvDeF1KfhiKJRGeh3PY93ufHacAxSzHpqmnp5v5uHD5vIeR07P2Xjwwjl4pTBs3GsQq6r9cmthS9fdhy4YoQgxAOPxDBDm_ebJ-VtDA5yTLF-89jowMr49D4RFE5tGBhb61eX8kzRZmAQk4P3JuY_ddGoBxBzF6asfhIgLOkz05eX1QucMAn5bQGgRZIUY9gYd8YWe3HHS9Dl4r8Wy-s5_HpGLAw',
  },
  {
    id: 2,
    detailSlug: 'std-102',
    code: 'STD-102',
    type: 'Standard',
    status: 'pending',
    priceVnd: 1_690_000,
    capacityLabel: 'Tối đa 2 khách',
    description: 'Tầng thấp, yên tĩnh, phù hợp công tác ngắn ngày hoặc cặp đôi.',
    alt: 'Phòng Standard có bàn làm việc',
    image:
      'https://images.unsplash.com/photo-1631049307264-da0ec9ad703b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    detailSlug: 'deluxe-city-view',
    code: 'DLX-201',
    type: 'Deluxe',
    status: 'available',
    priceVnd: 2_790_000,
    capacityLabel: 'Tối đa 3 khách · Giường King',
    description: 'Không gian rộng, ban công nhìn phố, bồn tắm và bộ đồ ngủ cao cấp.',
    alt: 'Phòng Deluxe City View',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBw4flQn7skFzyHN1U6KCo2l2iyc1cR_umVcmDdnhUl8ye2f_Uu9VFmOfdz_-tIse-mEcnYOW_X9xgDKqtuRWkQXh3BDGexBj3v78143FCtYkZu_eUOnw_pBFSO_tDuKu9YDkk9aUdpNYWxCwTLPmg1BKN8Q7IDXqILsbvm9fgdqCAdp9q4YRmAtoj41rvnGXLNPU-T50Z449Khgk3OTh4v6kOc8Bhu7n8suVVm8k7Dmb4AHzWujIkCFdMPUWdruYhO8uGX4T3bYA',
  },
  {
    id: 4,
    detailSlug: 'deluxe-panorama-205',
    code: 'DLX-205',
    type: 'Deluxe',
    status: 'booked',
    priceVnd: 2_950_000,
    capacityLabel: 'Tối đa 3 khách',
    description: 'Góc phòng panorama, thích hợp kỷ niệm hoặc staycation xa hoa.',
    alt: 'Phòng Deluxe góc panorama',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlpDLaZDcEZ7VyiI4DibkzDdvLBXzE5IeFbbsc6zpTaKLDq1Nhb3lydjeXTYIwW35YctrsTOA-AT4LzGIP3CH2-Sb1NI5iNWeopBhz1kPC-yCMYCo5mZBQq8x6-cLQ3o79uR10ngCUXE5tgofTPH8ap07J7vb-yh7MOfDDySRy_rJseOJqz3bHSBe8sr8SJErSEXh6wF77c1dXbGUxKMCy18lGh2N99aJ14vFuK-6czMoMtFsc3ugUNHe5v74pra37viEcgEwrEg',
  },
  {
    id: 5,
    code: 'DLX-208',
    type: 'Deluxe',
    status: 'available',
    priceVnd: 3_200_000,
    capacityLabel: 'Tối đa 4 khách',
    description: 'Kết nối phòng communicating cho gia đình, view hồ bơi và khu đi bộ.',
    alt: 'Phòng Deluxe gia đình',
    image:
      'https://images.unsplash.com/photo-1611892440504-42a792e54d34?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 6,
    detailSlug: 'cherry-suite',
    code: 'SUT-301',
    type: 'Suite',
    status: 'available',
    priceVnd: 4_990_000,
    capacityLabel: 'Tối đa 4 khách · Phòng khách riêng',
    description:
      'Executive suite có phòng tiếp khách, minibar được refill hằng ngày và quyền lợi Executive Lounge.',
    alt: 'Executive Suite phòng khách',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC64gQmhwzdUSkPXHbKabI7BvGpDR813Jw_6gn1_5QXQ0t0_zPpopTC_GJuHlLUlJ1YHpCt2EXhd3hAu4JwlrcyqYCImjngFxWDIL4BrZmnO5VoQ6p7TJ_ARlAZbZRvl326bltGLnrsUQ66dXMjB5qabasvw_8mZRjq2yFJS-t8fzQ-RW0sKnRgxLZZOm7nES4mRhGUa3xksWNL_z86SkWHqFL6yl6bNuyrJJb4-T_5tPPfkgR0pHTfFDuE_dbiJeq0xrNxWCI8AA',
  },
  {
    id: 7,
    detailSlug: 'suite-grand-302',
    code: 'SUT-302',
    type: 'Suite',
    status: 'pending',
    priceVnd: 5_350_000,
    capacityLabel: 'Tối đa 4 khách · 2 WC',
    description: 'Thiết kế tách khu đêm/ngày, phòng tắm đôi và hệ thống âm thanh Bluetooth.',
    alt: 'Suite có phòng tắm đôi',
    image:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 8,
    detailSlug: 'royal-penthouse',
    code: 'PNT-701',
    type: 'Penthouse',
    status: 'booked',
    priceVnd: 12_900_000,
    capacityLabel: 'Tối đa 6 khách · Sân thượng riêng',
    description:
      'Penthouse tầng cao Cherry Signature: bếp show kitchen, jacuzzi và view 270°.',
    alt: 'Penthouse view thành phố',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuANsD8XDA6qYE7OrEoJntoADSCAFFVx5liI2F4uk1NideegT92mjQPAXk_cMQAUMCLL8mbf3LkJ5SWiLWn4sDjuFiC8CHWYCx1ugyDwspaqoJadFGvhzOMT5Yul8_znQ89reEU4joF4PLgcVCxsbHW_oj_2CLw6gALRX9l8Ijuwm5qjMJJ_tgt47cjDASHpCfbyHRmIAfDRGWkCW10KfO2qDlCTgRqtqaD323NXqOqN7WhoZQ_i2dOeSe_5rQeKoSKzrAbSo0asAA',
  },
];

/**
 * @param {typeof MOCK_ROOMS} rooms
 */
export function countByStatus(rooms) {
  return rooms.reduce(
    (acc, r) => {
      acc[r.status] += 1;
      return acc;
    },
    { available: 0, pending: 0, booked: 0 },
  );
}

export function formatPriceVnd(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}
