import axiosClient from './axiosClient';

/** @returns {Promise<import('../types/homeHero').HomeHeroConfig | null>} */
export async function fetchHomeHero() {
  const { data } = await axiosClient.get('/home/hero');
  if (!data?.success || !data?.data) return null;
  return data.data;
}
