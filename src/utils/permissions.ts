// Role-based permission utilities

export const UserRole = {
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Role ID mapping between backend (numbers) and frontend (strings)
export const RoleIdMapping = {
  1: UserRole.SUPERADMIN,
  2: UserRole.ADMIN,
  3: UserRole.CUSTOMER
} as const;

// Reverse mapping from string to number for API calls
export const RoleStringToNumber = {
  [UserRole.SUPERADMIN]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.CUSTOMER]: 3
} as const;

export interface UserPermissions {
  canEditRoles: boolean;
  canManageAccounts: boolean;
  canManageOrchids: boolean;
  canManageOrders: boolean;
  canDeleteAccounts: boolean;
}

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    return user;
  } catch {
    return null;
  }
};

// Get current user's role ID (converts from number to string)
export const getCurrentUserRoleId = (): string | null => {
  const user = getCurrentUser();
  const numericRoleId = user?.roleId;
  
  if (numericRoleId && numericRoleId in RoleIdMapping) {
    return RoleIdMapping[numericRoleId as keyof typeof RoleIdMapping];
  }
  
  return null;
};

// Check if current user is superadmin
export const isSuperAdmin = (): boolean => {
  const roleId = getCurrentUserRoleId();
  return roleId === UserRole.SUPERADMIN;
};

// Check if current user is admin or higher
export const isAdminOrHigher = (): boolean => {
  const roleId = getCurrentUserRoleId();
  return roleId === UserRole.SUPERADMIN || roleId === UserRole.ADMIN;
};

// Get user permissions based on role
export const getUserPermissions = (): UserPermissions => {
  const roleId = getCurrentUserRoleId();
  
  switch (roleId) {
    case UserRole.SUPERADMIN:
      return {
        canEditRoles: true,
        canManageAccounts: true,
        canManageOrchids: true,
        canManageOrders: true,
        canDeleteAccounts: true
      };
    
    case UserRole.ADMIN:
      return {
        canEditRoles: false, // Admin cannot edit roles
        canManageAccounts: true,
        canManageOrchids: true,
        canManageOrders: true,
        canDeleteAccounts: false // Only superadmin can delete accounts
      };
    
    case UserRole.CUSTOMER:
    default:
      return {
        canEditRoles: false,
        canManageAccounts: false,
        canManageOrchids: false,
        canManageOrders: false,
        canDeleteAccounts: false
      };
  }
};

// Check if user can edit another user's role
export const canEditUserRole = (): boolean => {
  const currentUserRoleId = getCurrentUserRoleId();
  
  // Only superadmin can edit roles
  return currentUserRoleId === UserRole.SUPERADMIN;
};

// Check if user can delete another user
export const canDeleteUser = (targetUserRoleId: string): boolean => {
  const currentUserRoleId = getCurrentUserRoleId();
  
  // Only superadmin can delete accounts
  if (currentUserRoleId !== UserRole.SUPERADMIN) {
    return false;
  }
  
  // Superadmin can delete any account except other superadmins
  return targetUserRoleId !== UserRole.SUPERADMIN;
};

// Check if user can edit another user's account
export const canEditUser = (targetUserRoleId: string): boolean => {
  const currentUserRoleId = getCurrentUserRoleId();
  
  // Superadmin can edit anyone
  if (currentUserRoleId === UserRole.SUPERADMIN) {
    return true;
  }
  
  // Admin cannot edit superadmin accounts
  if (currentUserRoleId === UserRole.ADMIN && targetUserRoleId === UserRole.SUPERADMIN) {
    return false;
  }
  
  // Admin can edit other admin and customer accounts
  if (currentUserRoleId === UserRole.ADMIN) {
    return targetUserRoleId === UserRole.ADMIN || targetUserRoleId === UserRole.CUSTOMER;
  }
  
  // Customers cannot edit any accounts
  return false;
};

// Convert numeric role ID to string role
export const convertNumericRoleToString = (numericRoleId: number): string | null => {
  return RoleIdMapping[numericRoleId as keyof typeof RoleIdMapping] || null;
};

// Convert string role to numeric ID for API calls
export const convertStringRoleToNumeric = (stringRole: string): number | null => {
  return RoleStringToNumber[stringRole as keyof typeof RoleStringToNumber] || null;
};

// Get role name by numeric ID (for backend compatibility)
export const getRoleNameByNumericId = (numericRoleId: number): string => {
  const stringRole = convertNumericRoleToString(numericRoleId);
  return stringRole ? getRoleName(stringRole) : 'Unknown';
};

// Get role name by ID
export const getRoleName = (roleId: string): string => {
  switch (roleId) {
    case UserRole.SUPERADMIN:
      return 'Super Admin';
    case UserRole.ADMIN:
      return 'Admin';
    case UserRole.CUSTOMER:
      return 'Customer';
    default:
      return 'Unknown';
  }
};

// Get available roles for selection based on current user's role
export const getAvailableRoles = (): Array<{ id: string; name: string; numericId: number }> => {
  const currentUserRoleId = getCurrentUserRoleId();
  
  if (currentUserRoleId === UserRole.SUPERADMIN) {
    // Superadmin can assign any role
    return [
      { id: UserRole.SUPERADMIN, name: 'Super Admin', numericId: 1 },
      { id: UserRole.ADMIN, name: 'Admin', numericId: 2 },
      { id: UserRole.CUSTOMER, name: 'Customer', numericId: 3 }
    ];
  }
  
  if (currentUserRoleId === UserRole.ADMIN) {
    // Admin can assign admin and customer roles
    return [
      { id: UserRole.ADMIN, name: 'Admin', numericId: 2 },
      { id: UserRole.CUSTOMER, name: 'Customer', numericId: 3 }
    ];
  }
  
  // Others cannot assign roles, but return empty array with correct type
  return [] as Array<{ id: string; name: string; numericId: number }>;
};
