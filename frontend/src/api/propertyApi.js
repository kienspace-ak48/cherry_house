import axiosClient from './axiosClient';

const propertyApi = {
  /**
   * Danh sách cơ sở (catalog — mặc định isActive=true).
   * @param {{ city?: string; kind?: string; isActive?: boolean | string }} [params]
   */
  async list(params = {}) {
    const res = await axiosClient.get('/catalog/properties', { params });
    return res.data;
  },

  /**
   * Chi tiết cơ sở theo slug — kèm gallery, amenities, subBranches, mapPin.
   */
  async getBySlug(slug) {
    const res = await axiosClient.get(`/catalog/properties/slug/${encodeURIComponent(slug)}`);
    return res.data;
  },

  async getById(id) {
    const res = await axiosClient.get(`/catalog/properties/${id}`);
    return res.data;
  },

  /**
   * Chi nhánh của một cơ sở.
   * @param {number | string} propertyId
   * @param {{ isActive?: boolean | string }} [params]
   */
  async listBranches(propertyId, params = {}) {
    const res = await axiosClient.get(`/catalog/properties/${propertyId}/branches`, { params });
    return res.data;
  },
};

export default propertyApi;
