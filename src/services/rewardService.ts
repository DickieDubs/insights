import api from '../services/cia-api';

export interface Reward {
  id: string;
  name: string;
  description?: string;
  pointsRequired: number;
  // Add other reward properties as needed based on your API response
}

/**
 * Creates a new reward.
 * @param rewardData The data for the new reward (excluding the ID).
 * @returns A Promise that resolves with the created Reward object.
 * @throws An error if the API call fails.
 */
export async function createReward(rewardData: Omit<Reward, 'id'>): Promise<Reward> {
  try {
    const response = await api.post('/rewards/create', rewardData);
    return response.data;
  } catch (error) {
    console.error('Error creating reward:', error);
    throw error;
  }
}

/**
 * Fetches a single reward by its ID.
 * @param rewardId The ID of the reward to fetch.
 * @returns A Promise that resolves with the Reward object if found, or null if not found.
 */
export async function getRewardById(rewardId: string): Promise<Reward | null> {
  try {
    const response = await api.get(`/rewards/${rewardId}`);
    // Assuming the API returns 404 for not found, Axios will throw an error.
    // If the API returns a specific data structure for not found,
    // you might need to adjust this check.
    return response.data as Reward;
  } catch (error) {
    // You might want to check for specific error types here, e.g., 404
    // if (axios.isAxiosError(error) && error.response?.status === 404) {
    //   return null;
    // }
    console.error(`Error fetching reward with ID ${rewardId}:`, error);
    throw error; // Re-throw the error for handling in the calling code
  }
}


