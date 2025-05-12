import api from '../services/cia-api';

export interface Brand {
  id: string;
  name: string;
  clientId: string;
  // Add other brand properties as needed based on your API response
}

export async function listBrands(clientId: string): Promise<Brand[]> { // Already correctly typed
  try {
    const response = await api.get<Brand[]>(`/brands?clientId=${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Error listing brands:', error);
    throw error; // Or handle the error as needed
  }
}

export async function createBrand(brandData: Omit<Brand, 'id'>): Promise<Brand> { // Already correctly typed
  try {
    const response = await api.post<Brand>('/brands/create', brandData);
    return response.data;
  } catch (error) {
    console.error('Error creating brand:', error);
    throw error;
  }
}

export async function getBrandById(brandId: string): Promise<Brand> { // Already correctly typed
  try {
    const response = await api.get<Brand>(`/brands/${brandId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting brand by ID:', error);
    throw error;
  }
}

export async function updateBrand(brandId: string, brandData: Omit<Brand, 'id'>): Promise<Brand> { // Already correctly typed
  try {
    const response = await api.put<Brand>(`/brands/${brandId}`, brandData);
    return response.data;
  } catch (error) {
    console.error('Error updating brand:', error);
    throw error;
  }
}

export async function deleteBrand(brandId: string): Promise<void> { // Already correctly typed
  try {
    await api.delete(`/brands/${brandId}`);
  } catch (error) {
    console.error('Error deleting brand:', error);
    throw error;
  }
}