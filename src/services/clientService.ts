export interface Client {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  roles: string[]
  createdAt: string
  updatedAt: string
  // Add other client properties as needed
}

export interface ClientCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  client: Client
  expiresAt: string
}

interface RawClient {
  id: string
  name: string
  email: string
  status?: 'active' | 'inactive'
  roles?: string[]
  createdAt?: {
    _seconds: number
    _nanoseconds: number
  }
  updatedAt?: {
    _seconds: number
    _nanoseconds: number
  }
  password?: string
  passwordHash?: string
  brandIds?: string[]
  phone?: string
}

import api from '../services/cia-api'

export const listClients = async (): Promise<Client[]> => {
  try {
    const response = await api.get('/clients')
    // The API returns { success: true, data: [...] }
    const clients = response.data.data || []

    // Transform the data to match our Client interface
    return (clients as RawClient[]).map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      status: client.status || 'active',
      roles: client.roles || [],
      createdAt: client.createdAt?._seconds
        ? new Date(client.createdAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
      updatedAt: client.updatedAt?._seconds
        ? new Date(client.updatedAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Error listing clients:', error)
    throw error
  }
}

export const createClient = async (
  clientData: Omit<Client, 'id'>
): Promise<Client> => {
  try {
    const response = await api.post('/clients/create', clientData)
    return response.data
  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
}

export const getClientById = async (clientId: string): Promise<Client> => {
  try {
    const response = await api.get(`/clients/${clientId}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching client with ID ${clientId}:`, error)
    throw error
  }
}

export const updateClient = async (
  clientId: string,
  clientData: Omit<Client, 'id'>
): Promise<Client> => {
  try {
    const response = await api.put(`/clients/${clientId}`, clientData)
    return response.data
  } catch (error) {
    console.error(`Error updating client with ID ${clientId}:`, error)
    throw error
  }
}

export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    await api.delete(`/clients/${clientId}`)
  } catch (error) {
    console.error(`Error deleting client with ID ${clientId}:`, error)
    throw error
  }
}

export const loginClient = async (
  credentials: ClientCredentials
): Promise<LoginResponse> => {
  try {
    const response = await api.post('/clients/login', credentials)
    return response.data
  } catch (error) {
    console.error('Error logging in client:', error)
    throw error
  }
}
