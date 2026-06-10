import axiosClient from './axiosClient';

/** @returns {Promise<import('../seo/types').SeoPublicConfig | null>} */
export async function fetchSeoConfig() {
  const { data } = await axiosClient.get('/seo/config');
  if (!data?.success || !data?.data) return null;
  return data.data;
}
