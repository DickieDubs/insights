
import { z } from 'zod';

export const LoginCredentialsSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

// Schema for creating and updating clients
// Aligned with CreateClientPayload in cia-api.ts
export const ClientSchema = z.object({
  id: z.string().optional(), // Optional for creation, present for update
  name: z.string().min(2, { message: "Name must be at least 2 characters long." }).max(100, { message: "Name must be 100 characters or less." }),
  email: z.string().email({ message: "Invalid email address." }).max(100, { message: "Email must be 100 characters or less." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }).optional(), // Optional only in the form for updates, required by API for create
  phone: z.string().max(20, { message: "Phone number must be 20 characters or less." }).optional().nullable().default(null),
  roles: z.array(z.string()).optional().default([]), 
  brandIds: z.array(z.string()).optional().default([]),
  status: z.enum(['active', 'inactive', 'pending']).optional().default('pending'),
}).superRefine((data, ctx) => {
  // Password is required for creation (when id is not present)
  if (!data.id && !data.password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password is required for new clients.",
      path: ["password"],
    });
  }
  // Password can be optional for updates (when id is present)
  if (data.id && data.password && data.password.length > 0 && data.password.length < 6) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "New password must be at least 6 characters long.",
      path: ["password"],
    });
  }
});

export type ClientFormData = z.infer<typeof ClientSchema>;

// Schema for Brands
export const BrandSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Brand name must be at least 2 characters.").max(100, "Brand name must be 100 characters or less."),
  clientId: z.string({ required_error: "Client ID is required." }),
});
export type BrandFormData = z.infer<typeof BrandSchema>;

// Schema for Campaigns
export const CampaignSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Campaign name must be at least 2 characters.").max(100, "Campaign name must be 100 characters or less."),
  clientId: z.string({ required_error: "Client ID is required." }),
  brandIds: z.array(z.string()).min(1, "At least one brand must be selected."),
  rewards: z.string().optional().default(""),
  startDate: z.string().optional(), 
  endDate: z.string().optional(),   
  status: z.enum(['draft', 'active', 'inactive', 'completed']).optional().default('draft'),
});
export type CampaignFormData = z.infer<typeof CampaignSchema>;

// Schema for Surveys
export const SurveyQuestionTypeSchema = z.enum(['multiple-choice', 'open-ended', 'rating']);
export type SurveyQuestionType = z.infer<typeof SurveyQuestionTypeSchema>;

export const SurveyQuestionSchema = z.object({
  id: z.string().optional(), // ID for existing questions
  tempId: z.string().optional(), // Temporary ID for new questions before saving
  text: z.string().min(1, "Question text cannot be empty.").max(500, "Question text is too long."),
  type: SurveyQuestionTypeSchema,
  options: z.array(z.string().min(1, "Option text cannot be empty.").max(100, "Option text is too long.")).optional(),
}).refine(data => {
  if (data.type === 'multiple-choice' && (!data.options || data.options.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Multiple-choice questions must have at least two options.",
  path: ["options"],
});

export const SurveySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Survey name must be at least 2 characters.").max(100, "Survey name must be 100 characters or less."),
  campaignId: z.string({ required_error: "A campaign must be selected." }),
  brandId: z.string({ required_error: "A brand must be selected." }),
  status: z.enum(['draft', 'active', 'closed']).optional().default('draft'),
  questions: z.array(SurveyQuestionSchema).optional().default([]),
});

export type SurveyFormData = z.infer<typeof SurveySchema>;
export type SurveyQuestionFormData = z.infer<typeof SurveyQuestionSchema>;
