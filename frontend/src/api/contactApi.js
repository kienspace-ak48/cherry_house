import axiosClient from './axiosClient';

const contactApi = {
  async submit({ fullName, email, phone, message }) {
    const res = await axiosClient.post('/contact', {
      fullName,
      email,
      phone,
      message,
    });
    return res.data;
  },
};

export default contactApi;
