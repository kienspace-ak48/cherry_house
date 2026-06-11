import axiosClient from './axiosClient';

/** @returns {Promise<import('../types/homePage').HomePageConfig | null>} */
export async function fetchHomeSections() {
  const { data } = await axiosClient.get('/home/sections');
  if (!data?.success || !data?.data) return null;
  return data.data;
}
