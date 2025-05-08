import type { Timestamp } from 'firebase/firestore';

// --- Client ---
export type ClientCampaign = {
  id: string; // Campaign ID
  title: string;
  surveys: number; // Count of surveys for this campaign linked to this client
  // Optional: status, startDate, endDate if needed for quick display on client page
};

export type Client = {
  id: string; // Firestore document ID
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone?: string;
  logoUrl?: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Archived';
  createdAt: string;
  updatedAt: string;
};

export type ClientFormValues = {
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone?: string;
  status: Client['status'];
};

// --- Campaign ---
export type Campaign = {
  id: string;
  title: string;
  clientId: string;
  clientName?: string;
  productType: string;
  status: 'Active' | 'Completed' | 'Planning' | 'Paused' | 'Archived' | 'Draft';
  startDate: string;
  endDate: string;
  targetAudience: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CampaignFormValues = {
  title: string;
  clientId: string;
  productType: string;
  status: Campaign['status'];
  startDate: Date;
  endDate: Date;
  targetAudience: string;
  description?: string;
};


// --- Survey ---
export type SurveyQuestionOption = {
  id?: string;
  value: string;
};

export type SurveyQuestion = {
  id?: string;
  text: string;
  type: 'multiple-choice' | 'rating' | 'text' | 'ranking';
  options?: SurveyQuestionOption[];
};

export type Survey = {
  id: string;
  name: string;
  description?: string;
  campaignId: string;
  campaignName?: string;
  status: 'Draft' | 'Planning' | 'Active' | 'Paused' | 'Completed' | 'Archived';
  type: string;
  rewardProgramId?: string | null;
  rewardProgramName?: string;
  questions: SurveyQuestion[];
  responseCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type SurveyFormValues = {
  name: string;
  description?: string;
  campaignId: string;
  status: Survey['status'];
  type: string;
  rewardProgramId?: string | null;
  questions?: SurveyQuestion[];
};


// --- Brand Profile ---
export type BrandProfile = {
  id: string;
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  toneOfVoice: string;
  updatedAt: string;
};

// --- Reward Program ---
export type RewardProgram = {
  id: string;
  name: string;
  type: 'Points' | 'Raffle' | 'Bonus' | 'Other';
  status: 'Active' | 'Inactive' | 'Draft';
  description?: string; // Made optional
  config: {
    pointsPerSurvey?: number;
    entryPerSurvey?: number;
    bonusAmount?: string;
    condition?: string;
  };
  createdAt: string;
  updatedAt: string;
};

// --- Redemption Item ---
export type RedemptionItem = {
    id: string;
    name: string;
    type: 'Gift Card' | 'Coupon' | 'Merchandise' | 'Other';
    pointsCost?: number;
    stock?: number | null;
    isActive: boolean;
    imageUrl?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
};

// --- User Preferences (Example for settings page) ---
export type UserPreferences = {
  id: string;
  receiveNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  updatedAt: string;
};

// --- Consumer ---
export type Consumer = {
  id: string; // Firestore document ID
  name: string;
  email: string;
  avatarUrl?: string;
  segment?: string; // e.g., 'Early Adopter', 'Brand Loyalist'
  notes?: string;
  surveysTaken?: number; // Could be a denormalized count
  lastActive?: string; // ISO string date
  createdAt: string;
  updatedAt: string;
};

export type ConsumerFormValues = {
  name: string;
  email: string;
  segment?: string;
  notes?: string;
};

// --- Trends ---
export type TimeSeriesDataPoint = {
  date: string; // e.g., "2024-01", "2024-W23"
  value: number;
};

export type CategoricalDataPoint = {
  name: string;
  value: number;
};

export type TrendData = {
  productMentions: TimeSeriesDataPoint[];
  flavorPreferences: CategoricalDataPoint[];
  sentimentOverTime: TimeSeriesDataPoint[];
  // Add more trend types as needed
};
