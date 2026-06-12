import axiosClient from './axiosClient';

export async function fetchCatalogCities() {
  const { data } = await axiosClient.get('/geo/catalog-cities');
  if (!data.success) throw new Error(data.message || 'Không tải được danh sách thành phố');
  return data.data;
}

export async function fetchProvinces() {
  const { data } = await axiosClient.get('/geo/provinces');
  if (!data.success) throw new Error(data.message || 'Không tải được tỉnh/thành');
  return data.data;
}

export async function fetchGeoBundle() {
  const { data } = await axiosClient.get('/geo/bundle');
  if (!data.success) throw new Error(data.message || 'Không tải được dữ liệu địa giới');
  return data.data;
}
