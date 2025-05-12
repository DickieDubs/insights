import api from '../services/cia-api';

export interface Admin {
  id?: string; // Made optional as it might not be present on creation
  name: string;
  email: string;
  // Add other admin properties as needed
}

export interface AdminCredentials {
  email: string;
  password: string;
}

/**
 * Fetches an admin by their ID.
 * @param adminId The ID of the admin to fetch.
 * @returns A promise that resolves with the admin data.
 */
export const getAdminById = async (adminId: string): Promise<Admin> => { // Changed return type back to Admin based on later instruction processing
  try {
    const response = await api.get(`/admins/${adminId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching admin with ID ${adminId}:`, error);
    throw error;
  }
};

/**
 * Creates a new admin.
 * @param adminData The data for the new admin.
 * @returns A promise that resolves with the created admin data.
 */
export const createAdmin = async (adminData: Omit<Admin, 'id'>): Promise<Admin> => { // Already correct based on previous instructions
  try {
    const response = await api.post('/admins/create', adminData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

/**
 * Updates an existing admin.
 * @param adminId The ID of the admin to update.
 * @param adminData The updated data for the admin.
 * @returns A promise that resolves with the updated admin data.
 */
export const updateAdmin = async (adminId: string, adminData: Omit<Admin, 'id'>): Promise<Admin> => { // Already correct based on previous instructions
  try {
    const response = await api.put(`/admins/${adminId}`, adminData);
    return response.data;
  } catch (error) {
    console.error(`Error updating admin with ID ${adminId}:`, error);
    throw error;
  }
};

/**
 * Logs in an admin.
 * @param credentials The login credentials for the admin.
 * @returns A promise that resolves with the login response data.
 */
export const loginAdmin = async (credentials: AdminCredentials): Promise<any> => { // Already correct based on previous instructions
  try {
    const response = await api.post('/admins/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in admin:', error);
    throw error;
  }
};