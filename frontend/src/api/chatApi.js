import axiosClient from './axiosClient';

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
