import type { LoginCredentials, ClientFormData, BrandFormData, CampaignFormData, SurveyFormData, SurveyQuestionFormData } from '@/lib/schemas';
import axios from 'axios';
import { storage } from '@/lib/storage';

// --- INTERFACES ---

/**
 * Represents a client user.
 */
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles?: string[]; // e.g., ["VIEW_ONLY", "EDITOR"]
  brandIds?: string[];
  status?: 'active' | 'inactive' | 'pending';
  // Add other relevant fields based on API responses if needed
}

/**
 * Represents a brand.
 */
export interface Brand {
  id: string;
  name: string;
  clientId: string; // ID of the client this brand belongs to
  // Add other relevant fields
}

/**
 * Represents a brand with its client's name for easier display.
 */
export interface BrandWithClientName extends Brand {
  clientName?: string;
}


/**
 * Represents a campaign.
 */
export interface Campaign {
  id:string;
  name: string;
  clientId: string;
  brandIds: string[];
  rewards?: string; // Or a more complex object if needed
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
  status?: 'active' | 'inactive' | 'completed' | 'draft';
  // Add other relevant fields
}

/**
 * Represents a campaign with its client's name and brand names for easier display.
 */
export interface CampaignWithDetails extends Campaign {
  clientName?: string;
  brandNames?: string[];
}


/**
 * Represents a survey.
 */
export interface Survey {
  id: string;
  name: string;
  campaignId: string;
  brandId: string;
  questions?: SurveyQuestion[]; // Array of questions
  status?: 'draft' | 'active' | 'closed';
  // Add other relevant fields
}

export interface SurveyQuestion {
    id: string;
    text: string;
    type: 'multiple-choice' | 'open-ended' | 'rating'; // Example types
    options?: string[]; // For multiple-choice
    // Add other question-specific fields
}

/**
 * Represents a survey with its campaign's and brand's name for easier display.
 */
export interface SurveyWithDetails extends Survey {
  campaignName?: string;
  brandName?: string;
  clientName?: string; // Potentially useful if campaign->client is resolved
}


/**
 * Represents a report.
 * This is a generic structure; specific reports might have different data shapes.
 */
export interface Report<TData = any> { // Added generic type for data
  id?: string; // Or may not have an ID if it's a generated analysis
  name?: string; // e.g., "Demographic Report for Survey X"
  data: TData; // Actual report data, structure will vary
  // Add other relevant fields like generation date, etc.
}

// Specific Report Data Structures (Examples)
export interface DemographicReportData {
    ageGroups?: Array<{ range: string; count: number }>;
    genderDistribution?: Array<{ gender: string; count: number }>;
    // ... other demographic insights
}

export interface SurveyAnalysisData {
    completionRate?: number;
    averageRating?: number;
    keyThemes?: Array<{ theme: string; mentions: number }>;
    // ... other analysis metrics
}

// Updated to include potential dashboard metrics
export interface SystemReportData {
  totalClients?: number;
  activeCampaigns?: number;
  surveysConducted?: number;
  totalResponses?: number;
  averageRating?: number;
  recommendationScore?: number; // Or nps
  nps?: number;
  totalReportsGenerated?: number; // Keep existing if needed
  [key: string]: any; // Allow other potential fields
}


// --- API SETUP ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://cia-api-cf9bcb3349bc.herokuapp.com';
console.log('BASE URL',API_BASE_URL)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('API request unauthorized:', error.response.data);
      // AuthContext usually handles redirection on 401 if token expires
      // storage.clearAll();
      // if (typeof window !== 'undefined') {
      //    window.location.href = '/login/admin';
      // }
    }
    return Promise.reject(error);
  }
);

// Helper to extract data from various API response structures
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractData = (responseData: any, entityKey: string): any => {
  const isPluralKey = entityKey.endsWith('s');
  const defaultReturnValue = isPluralKey ? [] : null;

  if (responseData === null || responseData === undefined) {
    return defaultReturnValue;
  }

  // Case 1: Direct data (e.g., response is the array/object itself)
  if (entityKey === 'response') {
     if (isPluralKey && !Array.isArray(responseData)) return [];
     if (!isPluralKey && Array.isArray(responseData)) return null;
     return responseData;
  }

  // Case 2: responseData is an object containing the entityKey (e.g. { clients: [...] })
  if (typeof responseData === 'object' && entityKey in responseData) {
    const value = responseData[entityKey];
    if (isPluralKey && (value === undefined || value === null)) return [];
    if (isPluralKey && !Array.isArray(value)) return [];
    if (!isPluralKey && Array.isArray(value)) return null;
    return value;
  }

  // Case 3: responseData has a 'data' property, which then contains entityKey (e.g. { data: { clients: [...] } })
  if (typeof responseData === 'object' && responseData.data && typeof responseData.data === 'object' && entityKey in responseData.data) {
    const valueInData = responseData.data[entityKey];
    if (isPluralKey && (valueInData === undefined || valueInData === null)) return [];
    if (isPluralKey && !Array.isArray(valueInData)) return [];
    if (!isPluralKey && Array.isArray(valueInData)) return null;
    return valueInData;
  }

  // Case 4: responseData is the single entity itself (e.g., GET /client/1 -> returns Client object directly)
  // This is a fallback if entityKey was not found. Be cautious as it might misinterpret the response.
  if (!isPluralKey && typeof responseData === 'object' && !Array.isArray(responseData)) {
    // Basic check if it looks like the entity (has an 'id' maybe?)
    // This is heuristic and might need refinement based on actual API responses.
    if ('id' in responseData || Object.keys(responseData).length > 0) {
        // console.warn(`extractData assuming response is the entity for key: ${entityKey}`, responseData);
        return responseData;
    }
  }


  // Case 5: responseData is an array but we expect a single entity (e.g. GET /report -> returns [{...report_data...}])
  if (!isPluralKey && Array.isArray(responseData) && responseData.length === 1) {
    // console.warn(`extractData assuming first element of array is the entity for key: ${entityKey}`, responseData[0]);
    return responseData[0];
  }
   // Case 6: responseData is an array and we expect an array (e.g. GET /list -> returns [{item1}, {item2}])
  if (isPluralKey && Array.isArray(responseData)) {
     // console.warn(`extractData assuming response is the array for key: ${entityKey}`, responseData);
     return responseData;
  }


  // console.warn(`extractData failed to find key '${entityKey}' in structure`, responseData);
  return defaultReturnValue;
};


// --- AUTHENTICATION ---
interface AuthResponse {
  token: string;
  message: string;
  user?: Partial<Client> & { id?: string; role?: 'admin' | 'client', uid?:string, userId?: string };
  client?: Client;
  data?: { // Handle nested data structure
      user?: Partial<Client> & { id?: string; role?: 'admin' | 'client', uid?:string, userId?: string };
      client?: Client;
      token?: string;
   }
}

export const loginAdmin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/admins/login', credentials);
  return data;
};

export const login = async (username: string, password: string): Promise<any> => {
  // This seems like a duplicate/alternative login, ensure it's needed or remove.
  // Replace fetch with apiClient if standardizing
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, { // Ensure correct path
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};

export interface CreateAdminPayload {
    name: string;
    email: string;
    password?: string;
    roles?: string[];
    phone?: string;
    status?: 'active' | 'inactive' | 'pending';
}
export const createAdmin = async (adminData: CreateAdminPayload): Promise<AuthResponse> => {
  // Adjust endpoint if needed
  const { data } = await apiClient.post<AuthResponse>('/admins/create', adminData);
  return data;
};

export const loginClient = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/clients/login', credentials);
  return data;
};

// --- CLIENTS CRUD ---
export interface CreateClientPayload {
  name: string;
  email: string;
  password?: string;
  roles?: string[];
  phone?: string;
  brandIds?: string[];
  status?: 'active' | 'inactive' | 'pending';
}
export type UpdateClientPayload = Partial<Omit<CreateClientPayload, 'password'>>;

export const getClients = async (): Promise<Client[]> => {
  try {
    const { data } = await apiClient.get('/clients');
    // Expecting { clients: [...] } or { data: { clients: [...] } } or just [...]
    console.log('FETCHED DATA',data)
    const exctracted= data['data'] as Client[] ?? []; // Use nullish coalescing
    console.log('EXTRACTED',exctracted)
    return exctracted;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};

export const getClient = async (id: string): Promise<Client | null> => {
  try {
    const { data } = await apiClient.get(`/clients/${id}`);
    // Expecting { client: {...} } or { data: { client: {...} } } or just {...}
    return extractData(data, 'client') as Client | null;
  } catch (error) {
    console.error(`Error fetching client ${id}:`, error);
    throw error;
  }
};

export const createClient = async (clientData: CreateClientPayload): Promise<Client> => {
  try {
    const { data } = await apiClient.post<AuthResponse>('/clients/create', clientData);
    // Look for 'client', 'user', or direct object
    const createdClient = data['data'] as Client
     if (createdClient) return createdClient as Client;

     // Fallback check if the response itself is the client object
     if (typeof data === 'object' && !Array.isArray(data) && data !== null && 'id' in data && 'email' in data && !('token' in data)) {
         return data as Client;
     }

     console.error("Created client data not found in expected structure:", data);
     throw new Error("Client created, but response data is not in the expected format.");
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
};

export const updateClient = async (id: string, clientData: UpdateClientPayload): Promise<Client> => {
 try {
    const { data } = await apiClient.put(`/clients/${id}`, clientData);
    const updatedClient = extractData(data, 'client');
    if (updatedClient) return updatedClient as Client;

     if (typeof data === 'object' && !Array.isArray(data) && data !== null && 'id' in data && 'email' in data) {
         return data as Client;
     }

     console.error("Updated client data not found in expected structure:", data);
     throw new Error("Client updated, but response data is not in the expected format.");
  } catch (error)
  {
    console.error(`Error updating client ${id}:`, error);
    throw error;
  }
};

export const deleteClient = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/clients/${id}`);
  } catch (error) {
    console.error(`Error deleting client ${id}:`, error);
    throw error;
  }
};

// --- BRANDS CRUD ---
export interface CreateBrandPayload {
    name: string;
    clientId: string;
}
export type UpdateBrandPayload = Partial<Omit<CreateBrandPayload, 'clientId'>>;

export const getBrandsByClient = async (clientId: string): Promise<Brand[]> => {
  try {
    // Ensure endpoint supports filtering by clientId
    const { data } = await apiClient.get(`/brands?clientId=${clientId}`);
    return data['data'] as Brand[] ?? [];
  } catch (error) {
    console.error(`Error fetching brands for client ${clientId}:`, error);
    throw error;
  }
};

export const getAllBrands = async (): Promise<Brand[]> => {
  try {
    const { data } = await apiClient.get('/brands');
    return data['data'] as Brand[] ?? [];
  } catch (error) {
    console.error("Error fetching all brands:", error);
    throw error;
  }
};

export const getBrand = async (id: string): Promise<Brand | null> => {
 try {
    const { data } = await apiClient.get(`/brands/${id}`);
    return extractData(data, 'brand') as Brand | null;
  } catch (error) {
    console.error(`Error fetching brand ${id}:`, error);
    throw error;
  }
};

export const createBrand = async (brandData: CreateBrandPayload): Promise<Brand> => {
  try {
    const { data } = await apiClient.post('/brands/create', brandData);
    const createdBrand = extractData(data, 'brand');
     if (createdBrand) return createdBrand as Brand;

     if (typeof data === 'object' && !Array.isArray(data) && data !== null && 'id' in data && 'name' in data && 'clientId' in data) {
         return data as Brand;
     }

     console.error("Created brand data not found in expected structure:", data);
     throw new Error("Brand created, but response data is not in the expected format.");
  } catch (error) {
    console.error("Error creating brand:", error);
    throw error;
  }
};

export const updateBrand = async (id: string, brandData: UpdateBrandPayload): Promise<Brand> => {
  try {
    const { data } = await apiClient.put(`/brands/${id}`, brandData);
    const updatedBrand = extractData(data, 'brand');
     if (updatedBrand) return updatedBrand as Brand;

      if (typeof data === 'object' && !Array.isArray(data) && data !== null && 'id' in data && 'name' in data && 'clientId' in data) {
         return data as Brand;
     }

     console.error("Updated brand data not found in expected structure:", data);
     throw new Error("Brand updated, but response data is not in the expected format.");
  } catch (error) {
    console.error(`Error updating brand ${id}:`, error);
    throw error;
  }
};

export const deleteBrand = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/brands/${id}`);
  } catch (error) {
    console.error(`Error deleting brand ${id}:`, error);
    throw error;
  }
};

// --- CAMPAIGNS CRUD ---
export interface CreateCampaignPayload {
    name: string;
    clientId: string;
    brandIds: string[];
    rewards?: string;
    startDate?: string;
    endDate?: string;
    status?: 'draft' | 'active' | 'inactive' | 'completed';
}
export type UpdateCampaignPayload = Partial<Omit<CreateCampaignPayload, 'clientId'>>; // clientId typically not updatable

export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const { data } = await apiClient.get('/campaigns/list');
    return extractData(data, 'campaigns') as Campaign[] ?? [];
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};

export const getCampaignsByClient = async (clientId: string): Promise<Campaign[]> => {
  try {
    // Ensure endpoint supports filtering by clientId
    const { data } = await apiClient.get(`/campaigns?clientId=${clientId}`);
    return extractData(data, 'campaigns') as Campaign[] ?? [];
  } catch (error) {
    console.error(`Error fetching campaigns for client ${clientId}:`, error);
    throw error;
  }
};

export const getCampaign = async (id: string): Promise<Campaign | null> => {
  try {
    const { data } = await apiClient.get(`/campaigns/${id}`);
    return extractData(data, 'campaign') as Campaign | null;
  } catch (error) {
    console.error(`Error fetching campaign ${id}:`, error);
    throw error;
  }
};

export const createCampaign = async (campaignData: CreateCampaignPayload): Promise<Campaign> => {
  try {
    const { data } = await apiClient.post('/campaigns/create', campaignData);
     const createdCampaign = extractData(data, 'campaign');
     if (createdCampaign) return createdCampaign as Campaign;

      if (typeof data === 'object' && !Array.isArray(data) && data !== null && 'id' in data && 'name' in data && 'clientId' in data) {
         return data as Campaign;
     }

     console.error("Created campaign data not found in expected structure:", data);
     throw new Error("Campaign created, but response data is not in the expected format.");
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
};

export const updateCampaign = async (id: string, campaignData: UpdateCampaignPayload): Promise<Campaign> => {
  try {
    const { data } = await apiClient.put(`/campaigns/${id}`, campaignData);
    const updatedCampaign = extractData(data, 'campaign');
     if (updatedCampaign) return updatedCampaign as Campaign;

      if (typeof data === 'object' && !Array.isArray(data) && data !== null && 'id' in data && 'name' in data && 'clientId' in data) {
         return data as Campaign;
     }

     console.error("Updated campaign data not found in expected structure:", data);
     throw new Error("Campaign updated, but response data is not in the expected format.");
  } catch (error) {
    console.error(`Error updating campaign ${id}:`, error);
    throw error;
  }
};

export const deleteCampaign = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/campaigns/${id}`);
  } catch (error) {
    console.error(`Error deleting campaign ${id}:`, error);
    throw error;
  }
};

// --- SURVEYS CRUD ---
export interface CreateSurveyPayload {
    name: string;
    campaignId: string;
    brandId: string;
    status?: 'draft' | 'active' | 'closed';
    questions?: Omit<SurveyQuestion, 'id'>[];
}
export type UpdateSurveyPayload = Partial<Omit<CreateSurveyPayload, 'questions' | 'brandId' | 'campaignId'>>;

export interface AddQuestionPayload {
    text: string;
    type: SurveyQuestion['type'];
    options?: string[];
}

export const getSurveys = async (): Promise<Survey[]> => {
  try {
    const { data } = await apiClient.get('/surveys/list');
    return extractData(data, 'surveys') as Survey[] ?? [];
  } catch (error) {
    console.error("Error fetching surveys:", error);
    throw error;
  }
};

export const getSurveysByCampaign = async (campaignId: string): Promise<Survey[]> => {
  try {
    // Ensure endpoint supports filtering by campaignId
    const { data } = await apiClient.get(`/surveys?campaignId=${campaignId}`);
    return extractData(data, 'surveys') as Survey[] ?? [];
  } catch (error) {
    console.error(`Error fetching surveys for campaign ${campaignId}:`, error);
    throw error;
  }
};

export const getSurveysByBrand = async (brandId: string): Promise<Survey[]> => {
  try {
     // Ensure endpoint supports filtering by brandId
    const { data } = await apiClient.get(`/surveys?brandId=${brandId}`);
    return extractData(data, 'surveys') as Survey[] ?? [];
  } catch (error) {
    console.error(`Error fetching surveys for brand ${brandId}:`, error);
    throw error;
  }
};

export const getSurvey = async (id: string): Promise<Survey | null> => {
  try {
    const { data } = await apiClient.get(`/surveys/${id}`);
    return extractData(data, 'survey') as Survey | null;
  } catch (error) {
    console.error(`Error fetching survey ${id}:`, error);
    throw error;
  }
};

export const createSurvey = async (surveyData: CreateSurveyPayload): Promise<Survey> => {
  try {
    const { data } = await apiClient.post('/surveys/create', surveyData);
    const createdSurvey = extractData(data, 'survey');
     if (createdSurvey) return createdSurvey as Survey;

      if (typeof data === 'object' && !Array.isArray(data) && data !== null && 'id' in data && 'name' in data && 'campaignId' in data) {
         return data as Survey;
     }

     console.error("Created survey data not found in expected structure:", data);
     throw new Error("Survey created, but response data is not in the expected format.");
  } catch (error) {
    console.error("Error creating survey:", error);
    throw error;
  }
};

export const updateSurvey = async (id: string, surveyData: UpdateSurveyPayload): Promise<Survey> => {
  try {
    const { data } = await apiClient.put(`/surveys/${id}`, surveyData);
    const updatedSurvey = extractData(data, 'survey');
     if (updatedSurvey) return updatedSurvey as Survey;

     if (typeof data === 'object' && !Array.isArray(data) && data !== null && 'id' in data && 'name' in data && 'campaignId' in data) {
         return data as Survey;
     }

     console.error("Updated survey data not found in expected structure:", data);
     throw new Error("Survey updated, but response data is not in the expected format.");
  } catch (error) {
    console.error(`Error updating survey ${id}:`, error);
    throw error;
  }
};

export const addQuestionToSurvey = async (surveyId: string, questionData: AddQuestionPayload): Promise<SurveyQuestion> => {
  try {
    const { data } = await apiClient.post(`/surveys/${surveyId}/questions`, questionData);
    const createdQuestion = extractData(data, 'question');
     if (createdQuestion) return createdQuestion as SurveyQuestion;

     if (typeof data === 'object' && !Array.isArray(data) && data !== null && 'id' in data && 'text' in data) {
         return data as SurveyQuestion;
     }
     console.error("Created question data not found in expected structure:", data);
     throw new Error("Question added, but response data is not in the expected format.");
  } catch (error) {
    console.error(`Error adding question to survey ${surveyId}:`, error);
    throw error;
  }
};

export const updateQuestionInSurvey = async (surveyId: string, questionId: string, questionData: Partial<AddQuestionPayload>): Promise<SurveyQuestion> => {
  try {
    const { data } = await apiClient.put(`/surveys/${surveyId}/questions/${questionId}`, questionData);
    const updatedQuestion = extractData(data, 'question');
     if (updatedQuestion) return updatedQuestion as SurveyQuestion;

     if (typeof data === 'object' && !Array.isArray(data) && data !== null && 'id' in data && 'text' in data) {
        return data as SurveyQuestion;
    }
    console.error("Updated question data not found in expected structure:", data);
    throw new Error("Question updated, but response data is not in the expected format.");
  } catch (error) {
    console.error(`Error updating question ${questionId} in survey ${surveyId}:`, error);
    throw error;
  }
};

export const removeQuestionFromSurvey = async (surveyId: string, questionId: string): Promise<void> => {
  try {
    await apiClient.delete(`/surveys/${surveyId}/questions/${questionId}`);
  } catch (error) {
    console.error(`Error removing question ${questionId} from survey ${surveyId}:`, error);
    throw error;
  }
};

export const deleteSurvey = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/surveys/${id}`);
  } catch (error) {
    console.error(`Error deleting survey ${id}:`, error);
    throw error;
  }
};

// --- REPORTS & INSIGHTS ---
// Use the generic Report type with specific data structures
export const getDemographicReport = async (surveyId: string): Promise<Report<DemographicReportData> | null> => {
  try {
    const { data } = await apiClient.get(`/reports/demographic?surveyId=${surveyId}`);
    // Assume API returns the report structure directly or nested under 'report' or 'data'
    const reportData = extractData(data, 'report') || data; // Prioritize 'report' key, fallback to direct data
    if(reportData && typeof reportData === 'object') {
       return { data: reportData } as Report<DemographicReportData>; // Wrap raw data if needed
    }
    return null; // Or throw error if structure is unexpected
  } catch (error) {
    console.error(`Error fetching demographic report for survey ${surveyId}:`, error);
    throw error;
  }
};

export const getBrandInsightsReport = async (surveyId: string): Promise<Report<any> | null> => { // Use 'any' for now as it reuses demographic endpoint
  try {
    const { data } = await apiClient.get(`/reports/demographic?surveyId=${surveyId}`); // Uses demographic endpoint per instructions
     const reportData = extractData(data, 'report') || data;
     if(reportData && typeof reportData === 'object') {
       return { data: reportData } as Report<any>;
    }
     return null;
  } catch (error) {
    console.error(`Error fetching brand insights report for survey ${surveyId}:`, error);
    throw error;
  }
};

export const getSurveyAnalysisReport = async (surveyId: string): Promise<Report<SurveyAnalysisData> | null> => {
  try {
    const { data } = await apiClient.get(`/reports/survey/analysis/${surveyId}`);
    const reportData = extractData(data, 'report') || data;
     if(reportData && typeof reportData === 'object') {
       return { data: reportData } as Report<SurveyAnalysisData>;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching survey analysis report for survey ${surveyId}:`, error);
    throw error;
  }
};

export const getSurveyInsightsReport = async (surveyId: string): Promise<Report<any> | null> => { // Use 'any' for generic survey insights
  try {
    const { data } = await apiClient.get(`/reports/survey?surveyId=${surveyId}`);
    const reportData = extractData(data, 'report') || data;
    if(reportData && typeof reportData === 'object') {
       return { data: reportData } as Report<any>;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching survey insights report for survey ${surveyId}:`, error);
    throw error;
  }
};

export const getSystemReport = async (): Promise<Report<SystemReportData> | null> => {
  try {
    const { data } = await apiClient.get('/reports');
    const reportData = extractData(data, 'report') || data; // Check for 'report' key or direct data
     if(reportData && typeof reportData === 'object') {
       return { data: reportData } as Report<SystemReportData>;
    }
    // Handle case where API might return an array, take the first element?
    if(Array.isArray(reportData) && reportData.length > 0){
        return {data: reportData[0]} as Report<SystemReportData>;
    }
    return null;
  } catch (error) {
    console.error("Error fetching system report:", error);
    throw error;
  }
};


// General utility to fetch data by client ID if API filters by query param
export const getResourceByClient = async <T>(resourcePath: string, clientId: string): Promise<T[]> => {
  try {
    const { data } = await apiClient.get(`/${resourcePath}?clientId=${clientId}`);
    return extractData(data, resourcePath) as T[] ?? [];
  } catch (error) {
    console.error(`Error fetching ${resourcePath} for client ${clientId}:`, error);
    throw error;
  }
};

export default apiClient;
