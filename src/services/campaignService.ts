import api from '../services/cia-api';

export interface Campaign {
  id: string;
  name: string;
  // Add other campaign properties as needed based on your API response
}

/**
 * Fetches a list of all campaigns.
 * @returns A promise that resolves with an array of Campaign objects.
 */
export const listCampaigns = async () => {
  try {
    const response = await api.get('/campaigns');
    return response.data;
  } catch (error) {
    console.error('Error listing campaigns:', error);
    throw error; // Re-throw the error for the calling code to handle
  }
};

/**
 * Creates a new campaign.
 * @param campaignData - The data for the new campaign.
 * @returns A promise that resolves with the created Campaign object.
 */
export const createCampaign = async (campaignData: Omit<Campaign, 'id'>): Promise<Campaign> => {
  try {
    const response = await api.post('/campaigns/create', campaignData);
    return response.data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

/**
 * Fetches a campaign by its ID.
 * @param campaignId - The ID of the campaign to fetch.
 * @returns A promise that resolves with the Campaign object.
 */
export const getCampaignById = async (campaignId: string): Promise<Campaign> => {
  try {
    const response = await api.get(`/campaigns/${campaignId}`);    return response.data;
  } catch (error) {    console.error(`Error getting campaign with ID ${campaignId}:`, error);
    throw error;  }
};