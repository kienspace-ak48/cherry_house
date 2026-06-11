import axiosClient from './axiosClient';

const bookingApi = {
  /**
   * Kiểm tra phòng còn trống trong khoảng ngày (real-time từ DB).
   *
   * @param {{
   *   roomId?: number | string;
   *   propertySlug?: string;
   *   branchCode?: string;
   *   roomCode?: string;
   *   detailSlug?: string;
   *   checkIn: string;
   *   checkOut: string;
   *   excludeBookingId?: number | string;
   * }} payload
   */
  async checkAvailability(payload) {
    const res = await axiosClient.post('/bookings/check-availability', payload);
    return res.data?.data ?? res.data;
  },

  /**
   * Trạng thái giữ chỗ / đặt phòng theo chi nhánh.
   *
   * @param {{
   *   propertyId?: number | string;
   *   branchId?: number | string;
   *   propertySlug?: string;
   *   branchCode?: string;
   *   from?: string;
   *   to?: string;
   * }} [params]
   */
  async getOccupancy(params = {}) {
    const res = await axiosClient.get('/bookings/occupancy', { params });
    return res.data?.data ?? res.data;
  },

  /**
   * Lịch sử đặt phòng của user đang đăng nhập (có phân trang).
   *
   * @param {{ page?: number; pageSize?: number; filter?: 'all'|'upcoming'|'past'|'pending' }} [params]
   */
  async listMine(params = {}) {
    const res = await axiosClient.get('/bookings/me', { params });
    return res.data?.data ?? res.data;
  },
};

export default bookingApi;
