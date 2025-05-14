import type {
  LoginCredentials,
  ClientFormData,
  BrandFormData,
  CampaignFormData,
  SurveyFormData,
  SurveyQuestionFormData,
} from '@/lib/schemas'
import axios, { type AxiosError } from 'axios' // Ensured AxiosError is imported
import { storage } from '@/lib/storage'

// --- INTERFACES ---

/**
 * Represents a client user.
 */
export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  roles?: string[] // e.g., ["VIEW_ONLY", "EDITOR"]
  brandIds?: string[]
  status?: 'active' | 'inactive' | 'pending'
  // Add other relevant fields based on API responses if needed
}

/**
 * Represents a brand.
 */
export interface Brand {
  id: string
  name: string
  clientId: string // ID of the client this brand belongs to
  // Add other relevant fields
}

/**
 * Represents a brand with its client's name for easier display.
 */
export interface BrandWithClientName extends Brand {
  clientName?: string
}

/**
 * Represents a campaign.
 */
export interface Campaign {
  id: string
  name: string
  clientId: string
  brandIds: string[]
  rewards?: string // Or a more complex object if needed
  startDate?: string // ISO date string
  endDate?: string // ISO date string
  status?: 'active' | 'inactive' | 'completed' | 'draft'
  // Add other relevant fields
}

/**
 * Represents a campaign with its client's name and brand names for easier display.
 */
export interface CampaignWithDetails extends Campaign {
  clientName?: string
  brandNames?: string[]
}

/**
 * Represents a survey.
 */
export interface Survey {
  id: string
  name: string
  campaignId: string
  brandId: string
  questions?: SurveyQuestion[] // Array of questions
  status?: 'draft' | 'active' | 'closed'
  // Add other relevant fields
}

export interface SurveyQuestion {
  id: string
  text: string
  type: 'multiple-choice' | 'open-ended' | 'rating' // Example types
  options?: string[] // For multiple-choice
  // Add other question-specific fields
}

/**
 * Represents a survey with its campaign's and brand's name for easier display.
 */
export interface SurveyWithDetails extends Survey {
  campaignName?: string
  brandName?: string
  clientName?: string // Potentially useful if campaign->client is resolved
}

/**
 * Represents a report.
 * This is a generic structure; specific reports might have different data shapes.
 */
export interface Report<TData = any> {
  // Added generic type for data
  id?: string // Or may not have an ID if it's a generated analysis
  name?: string // e.g., "Demographic Report for Survey X"
  data: TData // Actual report data, structure will vary
  // Add other relevant fields like generation date, etc.
}

// Specific Report Data Structures (Examples)

// 1. Demographic Insights
export interface DemographicInsightsParams {
  surveyId?: string
  campaignId?: string
}
export interface DemographicInsightsData {
  age?: Record<string, number>
  gender?: Record<string, number>
  income?: Record<string, number>
  geo?: Record<string, number>
  favoriteStore?: Record<string, number>
  motivator?: Record<string, number>
  interests?: Record<string, number>
  spendingFrequency?: Record<string, number>
  verifiedStatus?: Record<string, number>
  [key: string]: any // For other dynamic fields
}

// 2. Question Insights
export interface QuestionInsightsParams {
  surveyId?: string
  campaignId?: string
}
export interface QuestionInsightsData {
  // Structure based on aggregated survey question answers
  // Example:
  // questionId1: { 'Option A': 25, 'Option B': 50 }
  // questionId2_text_responses: ["Response 1", "Response 2"]
  // questionId3_numeric_average: 4.2
  [questionId: string]: Record<string, number> | string[] | number | any
  competitorBrandResponses?: Record<string, number>
  reasonResponses?: Record<string, number>
}

// 3. Survey Analysis Report (AI Generated)
export interface SurveyAnalysisReportData {
  reportId?: string
  surveyId?: string
  generatedAt?: string
  fullReportText?: string
  insights?: string[] // Key insights bullet points
  sentiment?: {
    overall: string // e.g., "Positive", "Neutral", "Negative"
    details?: Record<string, number> // e.g., { positive: 0.7, neutral: 0.2, negative: 0.1 }
  }
  keyTrends?: string[]
  areasOfImprovement?: string[]
  [key: string]: any
}

// 4. Brand Insights
export interface BrandInsightsData {
  brandId?: string
  demographics?: DemographicInsightsData // Combined demographics for the brand
  surveyResponses?: QuestionInsightsData // Combined survey responses for the brand
  [key: string]: any
}

// 5. System Clients Report
export interface SystemClientsReportData {
  totalClients?: number
  statusBreakdown?: Record<'active' | 'pending' | 'inactive', number>
  roleDistribution?: Record<string, number> // e.g., { admin: 1, client: 10 }
  countryDistribution?: Record<string, number>
  averageBrandsPerClient?: number
  [key: string]: any
}

// 6. System Customers Report (Survey Takers / End Users)
export interface SystemCustomersReportData {
  totalCustomers?: number
  demographicsSummary?: {
    // Aggregated demographics
    ageDistribution?: Record<string, number>
    genderDistribution?: Record<string, number>
    incomeDistribution?: Record<string, number>
    geoDistribution?: Record<string, number>
    favoriteStoreDistribution?: Record<string, number>
    favoriteBrandDistribution?: Record<string, number>
  }
  verifiedPercentage?: number
  [key: string]: any
}

// 7. System Campaigns Report
export interface SystemCampaignsReportData {
  totalCampaigns?: number
  activeCampaigns?: number
  averageDurationDays?: number
  rewardTypesDistribution?: Record<string, number>
  rewardCriteriaDistribution?: Record<string, number>
  averageBrandsPerCampaign?: number
  averageClientsPerCampaign?: number // If applicable
  [key: string]: any
}

// 8. System Surveys Report
export interface SystemSurveysReportData {
  totalSurveys?: number
  totalQuestions?: number
  averageQuestionsPerSurvey?: number
  questionTypeDistribution?: Record<SurveyQuestion['type'], number>
  requiredQuestionPercentage?: number
  averageOptionsPerMultipleChoice?: number
  [key: string]: any
}

// 9. System Submissions Report
export interface SystemSubmissionsReportData {
  totalSubmissions?: number
  averageSubmissionsPerSurvey?: number
  averageSubmissionsPerCampaign?: number
  averageResponseTimeMinutes?: number // If tracked
  completionRate?: number // If partial submissions are possible
  engagementMetrics?: {
    // Example
    platformInteractions?: number
    timeSpentOnSurveys?: number
  }
  [key: string]: any
}

// 10. Full System Report
export interface FullSystemReportData {
  clientsReport?: SystemClientsReportData
  customersReport?: SystemCustomersReportData
  campaignsReport?: SystemCampaignsReportData
  surveysReport?: SystemSurveysReportData
  submissionsReport?: SystemSubmissionsReportData
  overallSummary?: {
    totalUsers?: number // Admin + Clients
    totalEngagementPoints?: number // Hypothetical overall engagement score
  }
  [key: string]: any
}

export interface ActivityLog {
  id: string
  type: 'client' | 'campaign' | 'survey' | 'report'
  action: string
  title: string
  subtitle: string
  timestamp: string
  userId?: string
  userName?: string
}

// --- API SETUP ---

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://cia-api-cf9bcb3349bc.herokuapp.com'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = storage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('API request unauthorized:', error.response.data)
      // AuthContext usually handles redirection on 401 if token expires
      // storage.clearAll();
      // if (typeof window !== 'undefined') {
      //    window.location.href = '/login/admin';
      // }
    }
    return Promise.reject(error)
  }
)

// Helper to extract data from various API response structures
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractData = (responseData: any, entityKey: string): any => {
  const isPluralKey = entityKey.endsWith('s')
  const defaultReturnValue = isPluralKey ? [] : null

  if (responseData === null || responseData === undefined) {
    return defaultReturnValue
  }

  // Case 1: Direct data (e.g., response is the array/object itself)
  if (entityKey === 'response') {
    if (isPluralKey && !Array.isArray(responseData)) return []
    if (!isPluralKey && Array.isArray(responseData)) return null
    return responseData
  }

  // Case 2: responseData is an object containing the entityKey (e.g. { clients: [...] })
  if (typeof responseData === 'object' && entityKey in responseData) {
    const value = responseData[entityKey]
    if (isPluralKey && (value === undefined || value === null)) return []
    if (isPluralKey && !Array.isArray(value)) return []
    if (!isPluralKey && Array.isArray(value)) return null
    return value
  }

  // Case 3: responseData has a 'data' property, which then contains entityKey (e.g. { data: { clients: [...] } })
  if (
    typeof responseData === 'object' &&
    responseData.data &&
    typeof responseData.data === 'object' &&
    entityKey in responseData.data
  ) {
    const valueInData = responseData.data[entityKey]
    if (isPluralKey && (valueInData === undefined || valueInData === null))
      return []
    if (isPluralKey && !Array.isArray(valueInData)) return []
    if (!isPluralKey && Array.isArray(valueInData)) return null
    return valueInData
  }

  // Case 4: responseData is the single entity itself (e.g., GET /client/1 -> returns Client object directly)
  // This is a fallback if entityKey was not found. Be cautious as it might misinterpret the response.
  if (
    !isPluralKey &&
    typeof responseData === 'object' &&
    !Array.isArray(responseData)
  ) {
    // Basic check if it looks like the entity (has an 'id' maybe?)
    // This is heuristic and might need refinement based on actual API responses.
    if ('id' in responseData || Object.keys(responseData).length > 0) {
      // console.warn(`extractData assuming response is the entity for key: ${entityKey}`, responseData);
      return responseData
    }
  }

  // Case 5: responseData is an array but we expect a single entity (e.g. GET /report -> returns [{...report_data...}])
  if (
    !isPluralKey &&
    Array.isArray(responseData) &&
    responseData.length === 1
  ) {
    // console.warn(`extractData assuming first element of array is the entity for key: ${entityKey}`, responseData[0]);
    return responseData[0]
  }
  // Case 6: responseData is an array and we expect an array (e.g. GET /list -> returns [{item1}, {item2}])
  if (isPluralKey && Array.isArray(responseData)) {
    // console.warn(`extractData assuming response is the array for key: ${entityKey}`, responseData);
    return responseData
  }

  // console.warn(`extractData failed to find key '${entityKey}' in structure`, responseData);
  return defaultReturnValue
}

// --- AUTHENTICATION ---
interface AuthResponse {
  token: string
  message: string
  user?: Partial<Client> & {
    id?: string
    role?: 'admin' | 'client'
    uid?: string
    userId?: string
  }
  client?: Client
  data?: {
    // Handle nested data structure
    user?: Partial<Client> & {
      id?: string
      role?: 'admin' | 'client'
      uid?: string
      userId?: string
    }
    client?: Client
    token?: string
  }
}

export const loginAdmin = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>(
    '/admins/login',
    credentials
  )
  return data
}

export const login = async (
  username: string,
  password: string
): Promise<any> => {
  // This seems like a duplicate/alternative login, ensure it's needed or remove.
  // Replace fetch with apiClient if standardizing
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    // Ensure correct path
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response.json()
}

export interface CreateAdminPayload {
  name: string
  email: string
  password?: string
  roles?: string[]
  phone?: string
  status?: 'active' | 'inactive' | 'pending'
}
export const createAdmin = async (
  adminData: CreateAdminPayload
): Promise<AuthResponse> => {
  // Adjust endpoint if needed
  const { data } = await apiClient.post<AuthResponse>(
    '/admins/create',
    adminData
  )
  return data
}

export const loginClient = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>(
    '/clients/login',
    credentials
  )
  return data
}

// --- CLIENTS CRUD ---
export interface CreateClientPayload {
  name: string
  email: string
  password?: string
  roles?: string[]
  phone?: string
  brandIds?: string[]
  status?: 'active' | 'inactive' | 'pending'
}
export type UpdateClientPayload = Partial<Omit<CreateClientPayload, 'password'>>

export const getClients = async (): Promise<Client[]> => {
  try {
    const { data } = await apiClient.get('/clients')
    // The API returns { success: true, data: [...] }
    const clients = data.data || []
    return clients.map((client: any) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      roles: client.roles || [],
      status: client.status || 'active',
      phone: client.phone,
      brandIds: client.brandIds || [],
      createdAt: client.createdAt?._seconds
        ? new Date(client.createdAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
      updatedAt: client.updatedAt?._seconds
        ? new Date(client.updatedAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching clients:', error)
    throw error
  }
}

export const getClient = async (id: string): Promise<Client | null> => {
  try {
    const { data } = await apiClient.get(`/clients/${id}`)
    // Expecting { client: {...} } or { data: { client: {...} } } or just {...}
    return extractData(data, 'client') as Client | null
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(
        `Client with ID ${id} not found (404). URL: ${error.config?.url}`
      )
      return null
    }
    console.error(`Error fetching client ${id}:`, error)
    throw error
  }
}

export const createClient = async (
  clientData: CreateClientPayload
): Promise<Client> => {
  try {
    const { data } = await apiClient.post<AuthResponse>(
      '/clients/create',
      clientData
    )
    // Look for 'client', 'user', or direct object
    const createdClient =
      extractData(data, 'client') || extractData(data, 'user')
    if (createdClient) return createdClient as Client

    // Fallback check if the response itself is the client object
    if (
      typeof data === 'object' &&
      !Array.isArray(data) &&
      data !== null &&
      'id' in data &&
      'email' in data &&
      !('token' in data)
    ) {
      return data as Client
    }

    console.error('Created client data not found in expected structure:', data)
    throw new Error(
      'Client created, but response data is not in the expected format.'
    )
  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
}

export const updateClient = async (
  id: string,
  clientData: UpdateClientPayload
): Promise<Client> => {
  try {
    const { data } = await apiClient.put(`/clients/${id}`, clientData)
    const updatedClient = extractData(data, 'client')
    if (updatedClient) return updatedClient as Client

    if (
      typeof data === 'object' &&
      !Array.isArray(data) &&
      data !== null &&
      'id' in data &&
      'email' in data
    ) {
      return data as Client
    }

    console.error('Updated client data not found in expected structure:', data)
    throw new Error(
      'Client updated, but response data is not in the expected format.'
    )
  } catch (error) {
    console.error(`Error updating client ${id}:`, error)
    throw error
  }
}

export const deleteClient = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/clients/${id}`)
  } catch (error) {
    console.error(`Error deleting client ${id}:`, error)
    throw error
  }
}

// --- BRANDS CRUD ---
export interface CreateBrandPayload {
  name: string
  clientId: string
}
export type UpdateBrandPayload = Partial<CreateBrandPayload> // Allow all fields to be updated

export const getBrands = async (): Promise<Brand[]> => {
  try {
    const { data } = await apiClient.get('/brands')
    // The API returns { success: true, data: [...] }
    const brands = data.data || []
    return brands.map((brand: any) => ({
      id: brand.id,
      name: brand.name,
      clientId: brand.clientId,
      description: brand.description,
      logoUrl: brand.logoUrl,
      status: brand.status || 'active',
      createdAt: brand.createdAt?._seconds
        ? new Date(brand.createdAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching brands:', error)
    throw error
  }
}

export const getAllBrands = async (): Promise<Brand[]> => {
  try {
    const { data } = await apiClient.get('/brands/list')
    return (extractData(data, 'brands') as Brand[]) ?? []
  } catch (error) {
    console.error('Error fetching all brands:', error)
    throw error
  }
}

export const getBrand = async (id: string): Promise<Brand | null> => {
  try {
    const { data } = await apiClient.get(`/brands/${id}`)
    return extractData(data, 'brand') as Brand | null
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(
        `Brand with ID ${id} not found (404). URL: ${error.config?.url}`
      )
      return null
    }
    console.error(`Error fetching brand ${id}:`, error)
    throw error
  }
}

export const createBrand = async (
  brandData: CreateBrandPayload
): Promise<Brand> => {
  try {
    const { data } = await apiClient.post('/brands/create', brandData)
    const createdBrand = extractData(data, 'brand')
    if (createdBrand) return createdBrand as Brand

    if (
      typeof data === 'object' &&
      !Array.isArray(data) &&
      data !== null &&
      'id' in data &&
      'name' in data &&
      'clientId' in data
    ) {
      return data as Brand
    }

    console.error('Created brand data not found in expected structure:', data)
    throw new Error(
      'Brand created, but response data is not in the expected format.'
    )
  } catch (error) {
    console.error('Error creating brand:', error)
    throw error
  }
}

export const updateBrand = async (
  id: string,
  brandData: UpdateBrandPayload
): Promise<Brand> => {
  try {
    const { data } = await apiClient.put(`/brands/${id}`, brandData)
    const updatedBrand = extractData(data, 'brand')
    if (updatedBrand) return updatedBrand as Brand

    if (
      typeof data === 'object' &&
      !Array.isArray(data) &&
      data !== null &&
      'id' in data &&
      'name' in data &&
      'clientId' in data
    ) {
      return data as Brand
    }

    console.error('Updated brand data not found in expected structure:', data)
    throw new Error(
      'Brand updated, but response data is not in the expected format.'
    )
  } catch (error) {
    console.error(`Error updating brand ${id}:`, error)
    throw error
  }
}

export const deleteBrand = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/brands/${id}`)
  } catch (error) {
    console.error(`Error deleting brand ${id}:`, error)
    throw error
  }
}

export const getBrandsByClient = async (clientId: string): Promise<Brand[]> => {
  try {
    const { data } = await apiClient.get(`/brands?clientId=${clientId}`)
    // The API returns { success: true, data: [...] }
    const brands = data.data || []
    return brands.map((brand: any) => ({
      id: brand.id,
      name: brand.name,
      clientId: brand.clientId,
      description: brand.description,
      logoUrl: brand.logoUrl,
      status: brand.status || 'active',
      createdAt: brand.createdAt?._seconds
        ? new Date(brand.createdAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
    }))
  } catch (error) {
    console.error(`Error fetching brands for client ${clientId}:`, error)
    throw error
  }
}

// --- CAMPAIGNS CRUD ---
export interface CreateCampaignPayload {
  name: string
  clientId: string
  brandIds: string[]
  rewards?: string
  startDate?: string
  endDate?: string
  status?: 'draft' | 'active' | 'inactive' | 'completed'
}
export type UpdateCampaignPayload = Partial<
  Omit<CreateCampaignPayload, 'clientId'>
> // clientId typically not updatable

export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const { data } = await apiClient.get('/campaigns')
    // The API returns { success: true, data: [...] }
    const campaigns = data.data || []
    return campaigns.map((campaign: any) => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      clientId: campaign.clientId,
      brandIds: campaign.brandIds || [],
      rewards: campaign.rewards || [],
      status: campaign.status || 'active',
      startDate: campaign.startDate?._seconds
        ? new Date(campaign.startDate._seconds * 1000).toISOString()
        : undefined,
      endDate: campaign.endDate?._seconds
        ? new Date(campaign.endDate._seconds * 1000).toISOString()
        : undefined,
      createdAt: campaign.createdAt?._seconds
        ? new Date(campaign.createdAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
      updatedAt: campaign.updatedAt?._seconds
        ? new Date(campaign.updatedAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    throw error
  }
}

export const getCampaignsByClient = async (
  clientId: string
): Promise<Campaign[]> => {
  try {
    // Ensure endpoint supports filtering by clientId
    const { data } = await apiClient.get(`/campaigns?clientId=${clientId}`)
    return (extractData(data, 'campaigns') as Campaign[]) ?? []
  } catch (error) {
    console.error(`Error fetching campaigns for client ${clientId}:`, error)
    throw error
  }
}

export const getCampaign = async (id: string): Promise<Campaign | null> => {
  try {
    const { data } = await apiClient.get(`/campaigns/${id}`)
    return extractData(data, 'campaign') as Campaign | null
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(
        `Campaign with ID ${id} not found (404). URL: ${error.config?.url}`
      )
      return null
    }
    console.error(`Error fetching campaign ${id}:`, error)
    throw error
  }
}

export const createCampaign = async (
  campaignData: CreateCampaignPayload
): Promise<Campaign> => {
  try {
    const { data } = await apiClient.post('/campaigns/create', campaignData)
    const createdCampaign = extractData(data, 'campaign')
    if (createdCampaign) return createdCampaign as Campaign

    if (
      typeof data === 'object' &&
      !Array.isArray(data) &&
      data !== null &&
      'id' in data &&
      'name' in data &&
      'clientId' in data
    ) {
      return data as Campaign
    }

    console.error(
      'Created campaign data not found in expected structure:',
      data
    )
    throw new Error(
      'Campaign created, but response data is not in the expected format.'
    )
  } catch (error) {
    console.error('Error creating campaign:', error)
    throw error
  }
}

export const updateCampaign = async (
  id: string,
  campaignData: UpdateCampaignPayload
): Promise<Campaign> => {
  try {
    const { data } = await apiClient.put(`/campaigns/${id}`, campaignData)
    const updatedCampaign = extractData(data, 'campaign')
    if (updatedCampaign) return updatedCampaign as Campaign

    if (
      typeof data === 'object' &&
      !Array.isArray(data) &&
      data !== null &&
      'id' in data &&
      'name' in data &&
      'clientId' in data
    ) {
      return data as Campaign
    }

    console.error(
      'Updated campaign data not found in expected structure:',
      data
    )
    throw new Error(
      'Campaign updated, but response data is not in the expected format.'
    )
  } catch (error) {
    console.error(`Error updating campaign ${id}:`, error)
    throw error
  }
}

export const deleteCampaign = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/campaigns/${id}`)
  } catch (error) {
    console.error(`Error deleting campaign ${id}:`, error)
    throw error
  }
}

// --- SURVEYS CRUD ---
export interface CreateSurveyPayload {
  name: string
  campaignId: string
  brandId: string
  status?: 'draft' | 'active' | 'closed'
  questions?: Omit<SurveyQuestion, 'id'>[]
}
export type UpdateSurveyPayload = Partial<
  Omit<CreateSurveyPayload, 'questions' | 'brandId' | 'campaignId'>
>

export interface AddQuestionPayload {
  text: string
  type: SurveyQuestion['type']
  options?: string[]
}

export const getSurveys = async (): Promise<Survey[]> => {
  try {
    const { data } = await apiClient.get('/surveys/list') // Note: using /surveys/list endpoint
    // The API returns { success: true, data: [...] }
    const surveys = data.data || []
    console.log('Raw survey data from API:', surveys) // Add logging

    // Map the surveys first
    const mappedSurveys = surveys.map((survey: any) => ({
      id: survey.id,
      name: survey.name,
      campaignId: survey.campaignId,
      brandId: survey.brandId,
      questions: survey.questions || [],
      status: survey.status || 'draft',
      createdAt: survey.createdAt?._seconds
        ? new Date(survey.createdAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
      updatedAt: survey.updatedAt?._seconds
        ? new Date(survey.updatedAt._seconds * 1000).toISOString()
        : new Date().toISOString(),
    }))

    // If any survey doesn't have questions, fetch them individually
    const surveysWithQuestions = await Promise.all(
      mappedSurveys.map(async (survey: Survey) => {
        if (!survey.questions || survey.questions.length === 0) {
          try {
            // Fetch individual survey to get questions
            const { data: surveyData } = await apiClient.get(
              `/surveys/${survey.id}`
            )
            const detailedSurvey = extractData(surveyData, 'survey')
            if (detailedSurvey && detailedSurvey.questions) {
              console.log(
                `Fetched questions for survey ${survey.id}:`,
                detailedSurvey.questions
              )
              return {
                ...survey,
                questions: detailedSurvey.questions,
              }
            }
          } catch (error) {
            console.warn(
              `Failed to fetch questions for survey ${survey.id}:`,
              error
            )
          }
        }
        return survey
      })
    )

    console.log('Final surveys with questions:', surveysWithQuestions)
    return surveysWithQuestions
  } catch (error) {
    console.error('Error fetching surveys:', error)
    throw error
  }
}

export const getSurveysByCampaign = async (
  campaignId: string
): Promise<Survey[]> => {
  try {
    // Ensure endpoint supports filtering by campaignId
    const { data } = await apiClient.get(`/surveys?campaignId=${campaignId}`)
    return (extractData(data, 'surveys') as Survey[]) ?? []
  } catch (error) {
    console.error(`Error fetching surveys for campaign ${campaignId}:`, error)
    throw error
  }
}

export const getSurveysByBrand = async (brandId: string): Promise<Survey[]> => {
  try {
    // Ensure endpoint supports filtering by brandId
    const { data } = await apiClient.get(`/surveys?brandId=${brandId}`)
    return (extractData(data, 'surveys') as Survey[]) ?? []
  } catch (error) {
    console.error(`Error fetching surveys for brand ${brandId}:`, error)
    throw error
  }
}

export const getSurvey = async (id: string): Promise<Survey | null> => {
  try {
    const { data } = await apiClient.get(`/surveys/${id}`)
    return extractData(data, 'survey') as Survey | null
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(
        `Survey with ID ${id} not found (404). URL: ${error.config?.url}`
      )
      return null
    }
    console.error(`Error fetching survey ${id}:`, error)
    throw error
  }
}

export const createSurvey = async (
  surveyData: CreateSurveyPayload
): Promise<Survey> => {
  try {
    const { data } = await apiClient.post('/surveys/create', surveyData)
    const createdSurvey = extractData(data, 'survey')
    if (createdSurvey) return createdSurvey as Survey

    if (
      typeof data === 'object' &&
      !Array.isArray(data) &&
      data !== null &&
      'id' in data &&
      'name' in data &&
      'campaignId' in data
    ) {
      return data as Survey
    }

    console.error('Created survey data not found in expected structure:', data)
    throw new Error(
      'Survey created, but response data is not in the expected format.'
    )
  } catch (error) {
    console.error('Error creating survey:', error)
    throw error
  }
}

export const updateSurvey = async (
  id: string,
  surveyData: UpdateSurveyPayload
): Promise<Survey> => {
  try {
    const { data } = await apiClient.put(`/surveys/${id}`, surveyData)
    const updatedSurvey = extractData(data, 'survey')
    if (updatedSurvey) return updatedSurvey as Survey

    if (
      typeof data === 'object' &&
      !Array.isArray(data) &&
      data !== null &&
      'id' in data &&
      'name' in data &&
      'campaignId' in data
    ) {
      return data as Survey
    }

    console.error('Updated survey data not found in expected structure:', data)
    throw new Error(
      'Survey updated, but response data is not in the expected format.'
    )
  } catch (error) {
    console.error(`Error updating survey ${id}:`, error)
    throw error
  }
}

export const addQuestionToSurvey = async (
  surveyId: string,
  questionData: AddQuestionPayload
): Promise<SurveyQuestion> => {
  try {
    const { data } = await apiClient.post(
      `/surveys/${surveyId}/questions`,
      questionData
    )
    const createdQuestion = extractData(data, 'question')
    if (createdQuestion) return createdQuestion as SurveyQuestion

    if (
      typeof data === 'object' &&
      !Array.isArray(data) &&
      data !== null &&
      'id' in data &&
      'text' in data
    ) {
      return data as SurveyQuestion
    }
    console.error(
      'Created question data not found in expected structure:',
      data
    )
    throw new Error(
      'Question added, but response data is not in the expected format.'
    )
  } catch (error) {
    console.error(`Error adding question to survey ${surveyId}:`, error)
    throw error
  }
}

export const updateQuestionInSurvey = async (
  surveyId: string,
  questionId: string,
  questionData: Partial<AddQuestionPayload>
): Promise<SurveyQuestion> => {
  try {
    const { data } = await apiClient.put(
      `/surveys/${surveyId}/questions/${questionId}`,
      questionData
    )
    const updatedQuestion = extractData(data, 'question')
    if (updatedQuestion) return updatedQuestion as SurveyQuestion

    if (
      typeof data === 'object' &&
      !Array.isArray(data) &&
      data !== null &&
      'id' in data &&
      'text' in data
    ) {
      return data as SurveyQuestion
    }
    console.error(
      'Updated question data not found in expected structure:',
      data
    )
    throw new Error(
      'Question updated, but response data is not in the expected format.'
    )
  } catch (error) {
    console.error(
      `Error updating question ${questionId} in survey ${surveyId}:`,
      error
    )
    throw error
  }
}

export const removeQuestionFromSurvey = async (
  surveyId: string,
  questionId: string
): Promise<void> => {
  try {
    await apiClient.delete(`/surveys/${surveyId}/questions/${questionId}`)
  } catch (error) {
    console.error(
      `Error removing question ${questionId} from survey ${surveyId}:`,
      error
    )
    throw error
  }
}

export const deleteSurvey = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/surveys/${id}`)
  } catch (error) {
    console.error(`Error deleting survey ${id}:`, error)
    throw error
  }
}

// --- REPORTS & INSIGHTS ---

export const getDemographicReport = async (
  params: DemographicInsightsParams
): Promise<Report<DemographicInsightsData> | null> => {
  try {
    const { data } = await apiClient.get('/reports/demographic', { params })
    const reportData = extractData(data, 'report') || data
    if (reportData && typeof reportData === 'object') {
      return { data: reportData } as Report<DemographicInsightsData>
    }
    return null
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(
        `Demographic Report not found (404) for params: ${JSON.stringify(
          params
        )}. URL: ${error.config?.url}`
      )
      return null
    }
    console.error('Error fetching demographic report:', error)
    throw error
  }
}

export const getQuestionInsights = async (
  params: QuestionInsightsParams
): Promise<Report<QuestionInsightsData> | null> => {
  try {
    const { data } = await apiClient.get('/reports/survey', { params }) // Endpoint seems to be /reports/survey
    const reportData = extractData(data, 'report') || data
    if (reportData && typeof reportData === 'object') {
      return { data: reportData } as Report<QuestionInsightsData>
    }
    return null
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(
        `Question Insights not found (404) for params: ${JSON.stringify(
          params
        )}. URL: ${error.config?.url}`
      )
      return null
    }
    console.error('Error fetching question insights:', error)
    throw error
  }
}

export const getSurveyAnalysisReport = async (
  surveyId: string
): Promise<Report<SurveyAnalysisReportData> | null> => {
  try {
    const { data } = await apiClient.get(`/reports/survey/analysis/${surveyId}`)
    const reportData = extractData(data, 'report') || data
    if (reportData && typeof reportData === 'object') {
      return { data: reportData } as Report<SurveyAnalysisReportData>
    }
    return null
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(
        `Survey Analysis Report for survey ${surveyId} not found (404). URL: ${error.config?.url}`
      )
      return null
    }
    console.error(
      `Error fetching survey analysis report for survey ${surveyId}:`,
      error
    )
    throw error
  }
}

export const getBrandInsightsReport = async (
  brandId: string
): Promise<Report<BrandInsightsData> | null> => {
  try {
    const { data } = await apiClient.get(`/reports/brand/${brandId}`)
    const reportData = extractData(data, 'report') || data
    if (reportData && typeof reportData === 'object') {
      return { data: reportData } as Report<BrandInsightsData>
    }
    return null
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(
        `Brand Insights Report for brand ${brandId} not found (404). URL: ${error.config?.url}`
      )
      return null
    }
    console.error(
      `Error fetching brand insights report for brand ${brandId}:`,
      error
    )
    throw error
  }
}

export const getSystemClientsReport =
  async (): Promise<Report<SystemClientsReportData> | null> => {
    try {
      const { data } = await apiClient.get('/reports/system/clients')
      const reportData = extractData(data, 'report') || data
      if (reportData && typeof reportData === 'object') {
        return { data: reportData } as Report<SystemClientsReportData>
      }
      return null
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(
          `System Clients Report not found (404). URL: ${error.config?.url}`
        )
        return null
      }
      console.error('Error fetching system clients report:', error)
      throw error
    }
  }

export const getSystemCustomersReport =
  async (): Promise<Report<SystemCustomersReportData> | null> => {
    try {
      const { data } = await apiClient.get('/reports/system/customers')
      const reportData = extractData(data, 'report') || data
      if (reportData && typeof reportData === 'object') {
        return { data: reportData } as Report<SystemCustomersReportData>
      }
      return null
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(
          `System Customers Report not found (404). URL: ${error.config?.url}`
        )
        return null
      }
      console.error('Error fetching system customers report:', error)
      throw error
    }
  }

export const getSystemCampaignsReport =
  async (): Promise<Report<SystemCampaignsReportData> | null> => {
    try {
      const { data } = await apiClient.get('/reports/system/campaigns')
      const reportData = extractData(data, 'report') || data
      if (reportData && typeof reportData === 'object') {
        return { data: reportData } as Report<SystemCampaignsReportData>
      }
      return null
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(
          `System Campaigns Report not found (404). URL: ${error.config?.url}`
        )
        return null
      }
      console.error('Error fetching system campaigns report:', error)
      throw error
    }
  }

export const getSystemSurveysReport =
  async (): Promise<Report<SystemSurveysReportData> | null> => {
    try {
      const { data } = await apiClient.get('/reports/system/surveys')
      const reportData = extractData(data, 'report') || data
      if (reportData && typeof reportData === 'object') {
        return { data: reportData } as Report<SystemSurveysReportData>
      }
      return null
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(
          `System Surveys Report not found (404). URL: ${error.config?.url}`
        )
        return null
      }
      console.error('Error fetching system surveys report:', error)
      throw error
    }
  }

export const getSystemSubmissionsReport =
  async (): Promise<Report<SystemSubmissionsReportData> | null> => {
    try {
      const { data } = await apiClient.get('/reports/system/submissions')
      const reportData = extractData(data, 'report') || data
      if (reportData && typeof reportData === 'object') {
        return { data: reportData } as Report<SystemSubmissionsReportData>
      }
      return null
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(
          `System Submissions Report not found (404). URL: ${error.config?.url}`
        )
        return null
      }
      console.error('Error fetching system submissions report:', error)
      throw error
    }
  }

export const getFullSystemReport =
  async (): Promise<Report<FullSystemReportData> | null> => {
    try {
      const { data } = await apiClient.get('/reports') // Root /reports endpoint
      const reportData = extractData(data, 'report') || data
      if (reportData && typeof reportData === 'object') {
        return { data: reportData } as Report<FullSystemReportData>
      }
      if (
        Array.isArray(reportData) &&
        reportData.length > 0 &&
        typeof reportData[0] === 'object'
      ) {
        // API might return array for /reports
        return { data: reportData[0] } as Report<FullSystemReportData>
      }
      return null
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(
          `Full System Report not found (404) at /reports. URL: ${error.config?.url}`
        )
        return null
      }
      console.error('Error fetching full system report:', error)
      throw error
    }
  }

// Deprecated: Original getSystemReport, prefer getFullSystemReport or specific system reports
export const getSystemReport = async (): Promise<Report<any> | null> => {
  console.warn(
    'getSystemReport is deprecated. Use getFullSystemReport or specific system reports instead.'
  )
  try {
    const { data } = await apiClient.get('/reports')
    const reportData = extractData(data, 'report') || data
    if (reportData && typeof reportData === 'object') {
      return { data: reportData } as Report<any>
    }
    if (Array.isArray(reportData) && reportData.length > 0) {
      return { data: reportData[0] } as Report<any>
    }
    return null
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(
        `(Deprecated) System Report not found (404) at /reports. URL: ${error.config?.url}`
      )
      return null
    }
    console.error('Error fetching (deprecated) system report:', error)
    throw error
  }
}

// General utility to fetch data by client ID if API filters by query param
export const getResourceByClient = async <T>(
  resourcePath: string,
  clientId: string
): Promise<T[]> => {
  try {
    const { data } = await apiClient.get(
      `/${resourcePath}?clientId=${clientId}`
    )
    return (extractData(data, resourcePath) as T[]) ?? []
  } catch (error) {
    console.error(
      `Error fetching ${resourcePath} for client ${clientId}:`,
      error
    )
    throw error
  }
}

export const getActivityLogs = async (params?: {
  page?: number
  type?: string
  search?: string
}): Promise<ActivityLog[]> => {
  try {
    const { data } = await apiClient.get('/logs', { params })
    // The API returns { success: true, data: [...] }
    const logs = data.data || []
    return logs.map((log: any) => ({
      id: log.id,
      type: log.type,
      action: log.action,
      title: log.title,
      subtitle: log.subtitle,
      timestamp: log.timestamp?._seconds
        ? new Date(log.timestamp._seconds * 1000).toISOString()
        : new Date().toISOString(),
      userId: log.userId,
      userName: log.userName,
    }))
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(
        'Activity logs endpoint not implemented yet. Using placeholder data.'
      )
      // Return placeholder data until the endpoint is implemented
      return [
        {
          id: '1',
          type: 'client',
          action: 'created',
          title: 'New Client Signed Up',
          subtitle: 'Example Corp',
          timestamp: new Date().toISOString(),
          userId: 'system',
          userName: 'System',
        },
        {
          id: '2',
          type: 'campaign',
          action: 'launched',
          title: 'Campaign Launched',
          subtitle: 'Summer Promotion 2024',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          userId: 'system',
          userName: 'System',
        },
        {
          id: '3',
          type: 'survey',
          action: 'created',
          title: 'New Survey Created',
          subtitle: 'Customer Feedback Survey',
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          userId: 'system',
          userName: 'System',
        },
        {
          id: '4',
          type: 'report',
          action: 'generated',
          title: 'System Report Generated',
          subtitle: 'Monthly Analytics Summary',
          timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
          userId: 'system',
          userName: 'System',
        },
        {
          id: '5',
          type: 'campaign',
          action: 'updated',
          title: 'Campaign Updated',
          subtitle: 'Brand Awareness Campaign',
          timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
          userId: 'system',
          userName: 'System',
        },
      ]
    }
    console.error('Error fetching activity logs:', error)
    throw error
  }
}

export default apiClient
