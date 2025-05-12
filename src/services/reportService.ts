import api from '../services/cia-api';
import { AxiosError } from 'axios';

export interface DemographicInsights {
  genderDistribution: Record<string, number>;
  ageBrackets: Record<string, number>;
  occupations: Record<string, number>;
  // Add other demographic properties as needed
}

export interface SurveyInsights {
  // Define structure based on your API response for survey insights
  [key: string]: any; // Placeholder
}

export interface SurveyAnalysis {
  // Define structure based on your API response for survey analysis
  [key: string]: any; // Placeholder
}

export interface SystemReport {
  totalResponses: number;
  averageRating: number;
  recommendationScore: number;
  // Add other system report properties as needed
}

/**
 * Fetches the system report overview.
 * @returns A promise that resolves with the system report data.
 */
export const getSystemReport = async (): Promise<any> => {
  try {
    const response = await api.get('/reports');
    return response.data as SystemReport; // Assuming SystemReport structure
  } catch (error) {
    console.error('Error fetching system report:', error);
    if (error instanceof AxiosError) {
      console.error('Axios error details:', error.response?.data, error.message);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
};

/**
 * Fetches demographic insights for a specific survey.
 * @param surveyId The ID of the survey.
 * @returns A promise that resolves with the demographic insights data.
 */
export const getDemographicInsights = async (surveyId: string): Promise<DemographicInsights> => {
  try {
    const response = await api.get(`/reports/demographic?surveyId=${surveyId}`);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error fetching demographic insights for survey ${surveyId}:`, error);
    if (error instanceof AxiosError) {
      console.error('Axios error details:', error.response?.data, error.message);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
};

/**
 * Fetches survey insights for a specific survey.
 * @param surveyId The ID of the survey.
 * @returns A promise that resolves with the survey insights data.
 */
export const getSurveyInsights = async (surveyId: string): Promise<SurveyInsights> => {
  try {
    const response = await api.get(`/reports/survey?surveyId=${surveyId}`);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error fetching survey insights for survey ${surveyId}:`, error);
    if (error instanceof AxiosError) {
      console.error('Axios error details:', error.response?.data, error.message);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
};

/**
 * Fetches survey analysis for a specific survey.
 * @param surveyId The ID of the survey.
 * @returns A promise that resolves with the survey analysis data.
 */
export const getSurveyAnalysis = async (surveyId: string): Promise<SurveyAnalysis | undefined> => {
  try {
    const response = await api.get(`/reports/survey/analysis/${surveyId}`);
    return response.data as SurveyAnalysis; // Assuming SurveyAnalysis structure
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        console.warn(`Survey analysis not found for survey ID: ${surveyId}`);
        return undefined; // Or return null, depending on your desired handling
      } else {
        console.error(`Error fetching survey analysis for survey ID ${surveyId}:`, error.message);
        throw error; // Re-throw other Axios errors
      }
    } else {
      console.error(`An unexpected error occurred while fetching survey analysis for survey ID ${surveyId}:`, error);
      throw error; // Re-throw unexpected errors
    }
  }
};