import axiosClient from './axiosClient';

const promoApi = {
  /**
   * @param {string} code
   * @param {number} subtotalVnd
   */
  async validate(code, subtotalVnd) {
    const res = await axiosClient.post('/promo-codes/validate', {
      code,
      subtotalVnd,
    });
    return res.data;
  },
};

export default promoApi;
