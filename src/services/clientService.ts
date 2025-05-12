export interface Client {
  id: string;
  name: string;
  // Add other client properties as needed based on your API response
  // Example: email: string;
  // Example: industry: string;
}

export interface ClientCredentials {
  email: string;
  password: string;
}
import api from '../services/cia-api';

export const listClients = async (): Promise<Client[]> => {
  try {
    const response = await api.get('/clients/list');
    return response.data;
  } catch (error) {
    console.error('Error listing clients:', error);
    throw error; // Or handle error more gracefully
  }
};

export const createClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
  try {
    const response = await api.post('/clients/create', clientData);
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

export const getClientById = async (clientId: string): Promise<Client> => {
  try {
    const response = await api.get(`/clients/${clientId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching client with ID ${clientId}:`, error);
    throw error;
  }
};

export const updateClient = async (clientId: string, clientData: Omit<Client, 'id'>): Promise<Client> => {
  try {
    const response = await api.put(`/clients/${clientId}`, clientData);
    return response.data;
  } catch (error) {
    console.error(`Error updating client with ID ${clientId}:`, error);
    throw error;
  }
};

export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    await api.delete(`/clients/${clientId}`);
  } catch (error) {
    console.error(`Error deleting client with ID ${clientId}:`, error);
    throw error;
  }
};

export const loginClient = async (credentials: ClientCredentials): Promise<any> => {
  try {
    const response = await api.post('/clients/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in client:', error);
    throw error;
  }
};