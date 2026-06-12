import axiosClient from './axiosClient';

export async function fetchPromoPopup() {
  const { data } = await axiosClient.get('/promo-popup');
  if (!data.success) throw new Error(data.message || 'Không tải được popup voucher');
  return data.data;
}
