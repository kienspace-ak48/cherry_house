import axiosClient from './axiosClient';

export async function fetchChatConfig() {
  const { data } = await axiosClient.get('/chat/config');
  if (!data?.success || !data?.data) return null;
  return data.data;
}

/**
 * @param {{ message: string; history?: Array<{ role: 'user' | 'assistant'; content: string }> }} payload
 */
export async function sendChatMessage(payload) {
  const { data } = await axiosClient.post('/chat/message', payload);
  if (!data?.success) {
    throw new Error(data?.message || 'Chat failed');
  }
  return data.data;
}
