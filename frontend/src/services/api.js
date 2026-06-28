import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getApod = (date) => api.get('/apod', { params: { date } });
export const getMarsPhotos = (params) => api.get('/mars', { params });
export const getNeo = (params) => api.get('/neo', { params });
export const getFavorites = (type) => api.get('/favorites', { params: { type } });
export const createFavorite = (data) => api.post('/favorites', data);
export const updateFavorite = (id, data) => api.patch(`/favorites/${id}`, data);
export const deleteFavorite = (id) => api.delete(`/favorites/${id}`);

export default api;
