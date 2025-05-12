import {
  getDemographicInsights,
  getSurveyInsights,
  getSurveyAnalysis,
  getSystemReport,
} from './reportService';
export interface DashboardData {
  summary: {
    totalResponses: number;
    averageRating: number;
    recommendationScore: number;
  };
  demographics: {
    genderDistribution: Record<string, number>;
    ageBrackets: Record<string, number>;
    occupations: Record<string, number>;
  };
  insights: any;
  analysis: any;
  systemStats: any;
}

export const getDashboardStats = async (surveyId: string): Promise<DashboardData> => {
  try {
    const [demographicsData, insightsData, analysisData, systemStatsData] = await Promise.all([
      getDemographicInsights(surveyId),
      getSurveyInsights(surveyId),
      getSurveyAnalysis(surveyId),
      getSystemReport(),
    ]);

    // Extract summary data - assuming the structure based on common report data
    const summary = {
      totalResponses: systemStatsData?.totalResponses || 0,
      averageRating: insightsData?.averageRating || 0,
      recommendationScore: insightsData?.recommendationScore || 0,
    };

    // Extract demographics data
    const demographics = {
      genderDistribution: demographicsData?.genderDistribution || {},
      ageBrackets: demographicsData?.ageBrackets || {},
      occupations: demographicsData?.occupations || {},
    };

    return {
      summary,
      demographics,
      insights: insightsData,
      analysis: analysisData,
      systemStats: systemStatsData,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return a default DashboardData structure in case of error
    return {
      summary: { totalResponses: 0, averageRating: 0, recommendationScore: 0 },
      demographics: { genderDistribution: {}, ageBrackets: {}, occupations: {} },
      insights: null,
      analysis: null,
      systemStats: null,
    };
  }
};