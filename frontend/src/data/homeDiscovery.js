/**
 * Nội dung khám phá trên trang chủ — khu vực & loại hình lưu trú.
 * @typedef {{ city: string, label: string, image: string, filterCity: string, comingSoon?: boolean }} PopularArea
 * @typedef {{ kind: import('./properties').PropertyKind extends infer K ? K : never, image: string }} AccommodationTypeCard
 */

/** @type {PopularArea[]} */
export const POPULAR_AREAS = [
  {
    city: 'Đà Lạt',
    label: 'Thành phố Đà Lạt',
    filterCity: 'Đà Lạt',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  },
  {
    city: 'Vũng Tàu',
    label: 'Thành phố Vũng Tàu',
    filterCity: 'Vũng Tàu',
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
  },
  {
    city: 'Đà Nẵng',
    label: 'Thành phố Đà Nẵng',
    filterCity: 'Đà Nẵng',
    image:
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
  },
  {
    city: 'Nha Trang',
    label: 'Thành phố Nha Trang',
    filterCity: 'Nha Trang',
    comingSoon: true,
    image:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80',
  },
  {
    city: 'Phú Quốc',
    label: 'Đảo Phú Quốc',
    filterCity: 'Phú Quốc',
    comingSoon: true,
    image:
      'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80',
  },
];

/** @type {{ kind: 'homestay'|'mini_hotel'|'villa'|'serviced_apartment', image: string }[]} */
export const ACCOMMODATION_TYPE_CARDS = [
  {
    kind: 'serviced_apartment',
    image:
      'https://images.unsplash.com/photo-1560448204-e02f11c45751?auto=format&fit=crop&w=800&q=80',
  },
  {
    kind: 'villa',
    image:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
  },
  {
    kind: 'homestay',
    image:
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80',
  },
  {
    kind: 'mini_hotel',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  },
];
