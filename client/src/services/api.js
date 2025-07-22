import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/alerts/low-stock'),
};

// Sales API
export const salesAPI = {
  getAll: () => api.get('/sales'),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  getStats: () => api.get('/sales/stats/summary'),
  getByDateRange: (startDate, endDate) => 
    api.get(`/sales/stats/range?startDate=${startDate}&endDate=${endDate}`),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getByProduct: (productId) => api.get(`/inventory/product/${productId}`),
  addStock: (data) => api.post('/inventory/add-stock', data),
  adjustStock: (data) => api.post('/inventory/adjust-stock', data),
  recordLoss: (data) => api.post('/inventory/record-loss', data),
  getSummary: () => api.get('/inventory/summary'),
};

export default api; 