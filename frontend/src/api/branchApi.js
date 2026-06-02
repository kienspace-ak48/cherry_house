import axiosClient from './axiosClient';

const branchApi = {
  /**
   * @param {{ propertyId?: number | string; isActive?: boolean | string }} [params]
   */
  async list(params = {}) {
    const res = await axiosClient.get('/catalog/branches', { params });
    return res.data;
  },

  async getById(id) {
    const res = await axiosClient.get(`/catalog/branches/${id}`);
    return res.data;
  },

  /**
   * @param {number | string} propertyId
   * @param {string} code — mã chi nhánh (vd: dl-hxh)
   */
  async getByPropertyAndCode(propertyId, code) {
    const res = await axiosClient.get(
      `/catalog/branches/property/${propertyId}/code/${encodeURIComponent(code)}`,
    );
    return res.data;
  },

  /**
   * @param {number | string} branchId — id DB hoặc dùng listRooms với propertySlug + branchCode
   * @param {{ status?: string; isActive?: boolean | string }} [params]
   */
  async listRooms(branchId, params = {}) {
    const res = await axiosClient.get(`/catalog/branches/${branchId}/rooms`, { params });
    return res.data;
  },
};

export default branchApi;
