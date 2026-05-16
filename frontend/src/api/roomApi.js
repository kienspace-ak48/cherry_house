import axiosClient from './axiosClient';

const roomApi = {
    async getAll(){
        return axiosClient.get('/rooms');
    },
    async create(payload) {
        return axiosClient.post('/rooms', payload);
    },
}

export default roomApi;