import axiosClient from './axiosClient';

const checkoutApi = {
  /**
   * Tạo booking + khởi tạo thanh toán.
   *
   * @param {{
   *   propertySlug: string;
   *   branchCode: string;
   *   detailSlug: string;
   *   checkIn: string;
   *   checkOut: string;
   *   guests?: string;
   *   guestName: string;
   *   guestPhone: string;
   *   guestEmail: string;
   *   specialNote?: string;
   *   promoCode?: string | null;
   *   paymentMethod: 'card' | 'momo' | 'bank' | 'wallet' | 'cherry_wallet';
   * }} payload
   */
  async startPay(payload) {
    const res = await axiosClient.post('/checkout/pay', payload);
    return res.data?.data ?? res.data;
  },

  async getStatus(bookingCode) {
    const res = await axiosClient.get(`/checkout/status/${encodeURIComponent(bookingCode)}`);
    return res.data?.data ?? res.data;
  },

  /** Xác thực redirect VNPay — truyền toàn bộ query string */
  async verifyVnpay(queryParams) {
    const res = await axiosClient.get('/checkout/verify/vnpay', { params: queryParams });
    return res.data?.data ?? res.data;
  },

  /** Xác thực redirect MoMo */
  async verifyMomo(queryParams) {
    const res = await axiosClient.get('/checkout/verify/momo', { params: queryParams });
    return res.data?.data ?? res.data;
  },
};

export default checkoutApi;
