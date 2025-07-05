export interface Orchid {
  orchidId: string;
  orchidName: string;
  orchidDescription: string;
  price: string;
  orchidUrl: string;
  isNatural: boolean;
  categoryId?: string;
  categoryName?: string;
}

// For backward compatibility, create an alias
export interface OrchidDTO extends Orchid {}

// Category types
export interface Category {
  categoryId: string;
  categoryName: string;
}

// Role types  
export interface Role {
  roleId: string;
  roleName: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  accountName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  token: string;
  accountId: string;
  accountName: string;
  email: string;
  roleId: string; // Changed to string for MongoDB
  roleName: string;
}

export interface RegisterResponse {
  accountId: string;
  accountName: string;
  email: string;
  roleId: string;
  roleName: string;
}

export interface AccountDTO {
  accountId: string;
  accountName: string;
  email: string;
  roleId: string;
  roleName: string;
}

export interface UpdateProfileRequest {
  accountName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result?: T;
}

export interface User {
  accountId: string;
  accountName: string;
  email: string;
  roleId: string; // Changed to string for MongoDB
  roleName: string;
  token: string;
}

// Admin types
export interface CreateAccountRequest {
  accountName: string;
  email: string;
  password: string;
  roleId: string;
}

export interface OrderDTO {
  id: string;
  accountId: string;
  accountName?: string; // For display purposes
  orderDate: string; // LocalDate from backend
  orderStatus: string;
  totalAmount: string;
  orderDetails: OrderDetailDTO[];
}

export interface OrderDetailDTO {
  id: string;
  orchidId: string;
  orchidName?: string; // For display purposes
  orchidUrl?: string; // For display purposes
  price: string;
  quantity: string;
  orderId?: string;
  subtotal?: string; // Calculated field (price * quantity)
}

// Order Detail types
export interface OrderDetail {
  id: string;
  orchid: Orchid;
  price: string;
  quantity: string;
  orderId: string;
}

// Order types
export interface Order {
  id: string;
  accountId: string;
  orderDate: string;
  orderStatus: string;
  totalAmount: string;
  orderDetails: OrderDetail[];
}

// Shopping Cart types - Updated to match backend DTOs
export interface CartItemDTO {
  orchidId: string;
  orchidName: string;
  price: string;
  quantity: string;
  subtotal: string;
  orchidUrl: string;
}

export interface ShoppingCartDTO {
  items: CartItemDTO[];
  totalAmount: string;
  totalItems: string;
}

// Legacy cart item interface for backward compatibility
export interface CartItem {
  orchid: Orchid;
  quantity: string;
  price: string;
}

// Additional Order DTO for API responses
export interface OrderResponse extends Order {
  accountName?: string;
}

// Admin Request Types
export interface CreateOrchidRequest {
  orchidName: string;
  isNatural: boolean;
  categoryId: string;
  orchidDescription: string;
  price: string;
  orchidUrl: string;
}

export interface UpdateOrchidRequest extends CreateOrchidRequest {}

export interface CreateOrderRequest {
  accountId: string;
  orderDate: string; // LocalDate format
  orderStatus: string;
  totalAmount: string;
  orderDetails: CreateOrderDetailRequest[];
}

export interface CreateOrderDetailRequest {
  orchidId: string;
  quantity: string;
  price: string;
}

// For the new order endpoint that accepts items
export interface CreateOrderFromCartRequest {
  items: CartItemDTO[];
}

export interface UpdateOrderRequest {
  orderDate: string;
  totalAmount: string;
  orderStatus: string; // Changed to match orderStatus field
  address?: string;
  phone?: string;
  notes?: string;
  accountId: string; // Should be string to match authentication
}

export interface CreateAccountRequest {
  accountName: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateAccountRequest {
  accountName: string;
  email: string;
  password?: string;
  roleId?: string; // Optional to allow non-superadmin users to update without changing role
}