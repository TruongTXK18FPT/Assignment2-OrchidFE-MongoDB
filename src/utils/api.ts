import axios from 'axios';
import type { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  RegisterResponse, 
  AccountDTO, 
  ApiResponse, 
  UpdateProfileRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  Orchid, 
  Category, 
  CreateAccountRequest, 
  UpdateAccountRequest, 
  OrderDTO,
  OrderDetailDTO,
  OrchidDTO,
  CreateOrchidRequest,
  UpdateOrchidRequest,
  CreateOrderFromCartRequest,
  UpdateOrderRequest,
  ShoppingCartDTO
} from '../types/orchid';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration - UPDATED VERSION
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    const isForgotPasswordRequest = error.config?.url?.includes('/forgot-password') || 
                                   error.config?.url?.includes('/reset-password');
    
    if (error.response?.status === 401 && !isForgotPasswordRequest) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error instanceof Error ? error : new Error(error.message ?? 'An error occurred'));
  }
);

export const authAPI = {
  register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response = await api.post('/accounts/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post('/accounts/login', data);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<AccountDTO>> => {
    const response = await api.get('/accounts/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<AccountDTO>> => {
    const response = await api.put('/accounts/profile', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<string>> => {
    const response = await api.post('/accounts/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/accounts/reset-password', data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await api.post('/accounts/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return response.data;
  },
};

export const orchidAPI = {
  getAllOrchids: async (): Promise<Orchid[]> => {
    const response = await api.get('/api/orchids/orchids');
    return response.data;
  },

  getOrchidsByCategory: async (categoryId: string): Promise<Orchid[]> => {
    const response = await api.get(`/api/orchids/category/${categoryId}`);
    return response.data;
  },

  searchOrchids: async (name: string): Promise<Orchid[]> => {
    const response = await api.get(`/api/orchids/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  getOrchidsByPriceRange: async (minPrice: string, maxPrice: string): Promise<Orchid[]> => {
    const response = await api.get(`/api/orchids/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`);
    return response.data;
  },

  getOrchidsByNaturalType: async (isNatural: boolean): Promise<Orchid[]> => {
    const response = await api.get(`/api/orchids/natural/${isNatural}`);
    return response.data;
  },
};

export const categoryAPI = {
  getCategoryByName: async (name: string): Promise<Category | null> => {
    try {
      const response = await api.get(`/api/categories/name/${encodeURIComponent(name)}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

export const adminAPI = {
  // Category CRUD Operations
  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get('/api/admin/categories');
    return response.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get(`/api/admin/categories/${id}`);
    return response.data;
  },

  createCategory: async (category: Omit<Category, 'categoryId'>): Promise<Category> => {
    const response = await api.post('/api/admin/categories', category);
    return response.data;
  },

  updateCategory: async (id: string, category: Omit<Category, 'categoryId'>): Promise<Category> => {
    const response = await api.put(`/api/admin/categories/${id}`, category);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/categories/${id}`);
  },

  // Orchid CRUD Operations
  getAllOrchids: async (): Promise<OrchidDTO[]> => {
    const response = await api.get('/api/admin/orchids');
    return response.data;
  },

  getOrchidById: async (id: string): Promise<OrchidDTO> => {
    const response = await api.get(`/api/admin/orchids/${id}`);
    return response.data;
  },

  createOrchid: async (orchid: CreateOrchidRequest): Promise<OrchidDTO> => {
    const response = await api.post('/api/admin/orchids', orchid);
    return response.data;
  },

  updateOrchid: async (id: string, orchid: UpdateOrchidRequest): Promise<OrchidDTO> => {
    const response = await api.put(`/api/admin/orchids/${id}`, orchid);
    return response.data;
  },

  deleteOrchid: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/orchids/${id}`);
  },

  // Order CRUD Operations
  getAllOrders: async (): Promise<OrderDTO[]> => {
    const response = await api.get('/api/admin/orders');
    return response.data;
  },

  getOrderById: async (id: string): Promise<OrderDTO> => {
    const response = await api.get(`/api/admin/orders/${id}`);
    return response.data;
  },

  createOrder: async (order: OrderDTO): Promise<OrderDTO> => {
    const response = await api.post('/api/admin/orders', order);
    return response.data;
  },

  updateOrder: async (id: string, order: UpdateOrderRequest): Promise<OrderDTO> => {
    const response = await api.put(`/api/admin/orders/${id}`, order);
    return response.data;
  },

  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/orders/${id}`);
  },

  // Account CRUD Operations
  getAllAccounts: async (): Promise<AccountDTO[]> => {
    const response = await api.get('/api/admin/accounts');
    return response.data;
  },

  getAccountById: async (id: string): Promise<AccountDTO> => {
    const response = await api.get(`/api/admin/accounts/${id}`);
    return response.data;
  },

  createAccount: async (account: CreateAccountRequest): Promise<AccountDTO> => {
    const response = await api.post('/api/admin/accounts', account);
    return response.data;
  },

  updateAccount: async (id: string, account: UpdateAccountRequest): Promise<AccountDTO> => {
    const response = await api.put(`/api/admin/accounts/${id}`, account);
    return response.data;
  },

  deleteAccount: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/accounts/${id}`);
  },
};

// Order API endpoints
export const orderAPI = {
  // Get orders by account ID
  getOrdersByAccount: async (accountId: string): Promise<OrderDTO[]> => {
    try {
      const response = await api.get(`/api/orders/account/${accountId}`);
      const serverOrders = response.data;
      
      // Also include temporary orders from localStorage
      const tempOrders = JSON.parse(localStorage.getItem('tempOrders') || '[]');
      const userTempOrders = tempOrders.filter((order: OrderDTO) => 
        order.accountId.toString() === accountId
      );
      
      return [...serverOrders, ...userTempOrders];
    } catch (error: any) {
      if (error.response?.status === 404) {
        // If endpoint doesn't exist, return only temp orders
        console.log('Server orders endpoint not found, returning temp orders only');
        const tempOrders = JSON.parse(localStorage.getItem('tempOrders') || '[]');
        return tempOrders.filter((order: OrderDTO) => 
          order.accountId.toString() === accountId
        );
      }
      throw error;
    }
  },

  // Get orders by status
  getOrdersByStatus: async (status: string): Promise<OrderDTO[]> => {
    const response = await api.get(`/api/orders/status/${status}`);
    return response.data;
  },

  // Get orders by date range
  getOrdersByDateRange: async (startDate: string, endDate: string): Promise<OrderDTO[]> => {
    const response = await api.get(`/api/orders/date-range`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string): Promise<OrderDTO> => {
    const response = await api.patch(`/api/orders/${id}/status`, null, {
      params: { orderStatus: status } // Use orderStatus parameter name to match backend
    });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<OrderDTO> => {
    const response = await api.patch(`/api/orders/${id}/cancel`);
    return response.data;
  },

  // Calculate order total
  calculateOrderTotal: async (id: string): Promise<string> => {
    const response = await api.get(`/api/orders/${id}/total`);
    return response.data;
  },

  // Get order details by order ID
  getOrderDetails: async (orderId: string): Promise<OrderDetailDTO[]> => {
    try {
      const response = await api.get(`/api/orders/${orderId}/details`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      if (error.response?.status === 404) {
        console.log('Order details endpoint not found');
        return [];
      }
      throw error;
    }
  },

  // Get specific order detail by detail ID
  getOrderDetailById: async (orderDetailId: string): Promise<OrderDetailDTO | null> => {
    try {
      const response = await api.get(`/api/orders/details/${orderDetailId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order detail by ID:', error);
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Create order - Updated to match backend structure
  createOrder: async (orderData: CreateOrderFromCartRequest): Promise<OrderDTO> => {
    try {
      // Try the customer order endpoint first
      const response = await api.post('/api/orders', orderData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 403) {
        // Backend endpoint doesn't exist or user doesn't have permission
        // Create a temporary order using localStorage as fallback
        console.log('Backend order endpoint not available, creating temporary order...');
        
        const tempOrder: OrderDTO = {
          id: Date.now().toString(), // Use timestamp as temporary ID - convert to string
          accountId: "temp-user", // Use string instead of number for temporary orders
          accountName: undefined, // Will be populated when viewing
          orderDate: new Date().toISOString().split('T')[0],
          orderStatus: 'pending',
          totalAmount: orderData.items.reduce((sum: number, item: any) => sum + parseFloat(item.subtotal ?? '0'), 0).toString(),
          orderDetails: orderData.items.map((item: any) => ({
            id: (Date.now() + Math.random()).toString(), // Temporary ID - convert to string
            orchidId: item.orchidId,
            orchidName: item.orchidName,
            orchidUrl: item.orchidUrl,
            price: item.price,
            quantity: item.quantity,
            orderId: Date.now().toString(),
            subtotal: item.subtotal
          }))
        };
        
        // Save to localStorage
        const existingOrders = JSON.parse(localStorage.getItem('tempOrders') || '[]');
        existingOrders.push(tempOrder);
        localStorage.setItem('tempOrders', JSON.stringify(existingOrders));
        
        return tempOrder;
      }
      throw error;
    }
  }
};

// Shopping Cart API endpoints
export const cartAPI = {
  // Get cart
  getCart: async (): Promise<ShoppingCartDTO> => {
    const response = await api.get('/api/cart');
    return response.data;
  },

  // Add to cart
  addToCart: async (orchidId: string, quantity: string): Promise<ShoppingCartDTO> => {
    const response = await api.post('/api/cart/add', null, {
      params: { orchidId, quantity }
    });
    return response.data;
  },

  // Update cart item
  updateCartItem: async (orchidId: string, quantity: string): Promise<ShoppingCartDTO> => {
    const response = await api.put('/api/cart/update', null, {
      params: { orchidId, quantity }
    });
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (orchidId: string): Promise<ShoppingCartDTO> => {
    const response = await api.delete(`/api/cart/remove/${orchidId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async (): Promise<void> => {
    await api.delete('/api/cart/clear');
  }
};

export default api;
