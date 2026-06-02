import axiosClient from './axiosClient';

const roomApi = {
  /**
   * @param {{
   *   branchId?: number | string;
   *   propertySlug?: string;
   *   branchCode?: string;
   *   roomTypeId?: number | string;
   *   status?: 'available' | 'pending' | 'booked';
   *   isActive?: boolean | string;
   * }} [params]
   */
  async list(params = {}) {
    const res = await axiosClient.get('/catalog/rooms', { params });
    return res.data;
  },

  async getById(id) {
    const res = await axiosClient.get(`/catalog/rooms/${id}`);
    return res.data;
  },

  /** @deprecated Dùng admin API — giữ cho tương thích cũ */
  async getAll() {
    return roomApi.list({ isActive: 'true' });
  },

  async create(payload) {
    return axiosClient.post('/rooms', payload);
  },
};

export default roomApi;
