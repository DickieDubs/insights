import api from '../services/cia-api';
import { AxiosError } from 'axios';

/**
 * Interface for Customer data.
 */
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string; // Assuming email is optional
  // Add other customer properties as needed based on your API response
}

/**
 * Fetches a customer by their phone number.
 * @param phoneNumber The phone number of the customer.
 * @returns A Promise that resolves with the customer data, or null if not found.
 */
export const getCustomerByPhone = async (phoneNumber: string): Promise<Customer | null> => {
  try {
    const response = await api.get(`/customers/${phoneNumber}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      if (error.response.status === 404) {
      // Assuming API returns 404 for not found
      return null;
    }
      console.error(`Error fetching customer with phone ${phoneNumber}:`, error.message, error.response?.data);
      throw error; // Re-throw other Axios errors
    }

    console.error(`Error fetching customer with phone ${phoneNumber}:`, error);
    // Re-throw other errors
    throw error;
  }
};

/**
 * Registers a new customer.
 * @param customerData The data for the new customer.
 * @returns A Promise that resolves with the created customer data.
 */
export const onboardCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
  try {
    const response = await api.post('/customers/register', customerData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error onboarding customer:", error.message, error.response?.data);
    } else {
      console.error("Error onboarding customer:", error);
    }
    throw error;
  }
};