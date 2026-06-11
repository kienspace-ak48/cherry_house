import axiosClient from './axiosClient';

const walletApi = {
  async getSummary() {
    const res = await axiosClient.get('/wallet');
    return res.data?.data ?? res.data;
  },

  async listTransactions(params = {}) {
    const res = await axiosClient.get('/wallet/transactions', { params });
    return res.data?.data ?? res.data;
  },
};

export default walletApi;
