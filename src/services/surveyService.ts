import api from '../services/cia-api';

export interface Survey {
  id: string;
}

export interface Question {
  id: string;
  // Assuming questions have an id and other properties
}


/**
 * Creates a new survey.
 * @param surveyData The data for the new survey.
 * @returns A promise that resolves with the created survey data.
 */
export const createSurvey = async (surveyData: Omit<Survey, 'id'>): Promise<Survey> => {
  try {
    const response = await api.post<Survey>('/surveys/create', surveyData);
    return response.data;
  } catch (error) {
    console.error('Error creating survey:', error);
    throw error;
  }
};
/**
 * Fetches a survey by its ID.
 * @param surveyId The ID of the survey to fetch.
 * @returns A promise that resolves with the survey data.
 */
export const getSurveyById = async (surveyId: string): Promise<Survey> => {
  try {
    const response = await api.get<Survey>(`/surveys/${surveyId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey with ID ${surveyId}:`, error);
    throw error; // Re-throw the error for the calling code to handle
  }
};

/**
 * Adds questions to an existing survey.
 * @param surveyId The ID of the survey to add questions to.
 * @param questions An array of question data to add.
 * @returns A promise that resolves with the updated survey data or confirmation.
 */
export const addSurveyQuestions = async (surveyId: string, questions: Question[]): Promise<Survey> => {
  try {
    const response = await api.post(`/surveys/${surveyId}/questions`, questions);
    return response.data;
  } catch (error) {
    console.error(`Error adding questions to survey with ID ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Deletes a single question from a survey.
 * @param surveyId The ID of the survey containing the question.
 * @param questionId The ID of the question to delete.
 * @returns A promise that resolves when the question is deleted.
 */
export const deleteSurveyQuestion = async (surveyId: string, questionId: string): Promise<void> => {
  try {
    await api.delete(`/surveys/${surveyId}/questions/${questionId}`);
  } catch (error) {
    console.error(`Error deleting question with ID ${questionId} from survey ${surveyId}:`, error);
    throw error;
  }
};