
"use client";

import type { Survey, Campaign, Brand, CreateSurveyPayload, UpdateSurveyPayload, SurveyWithDetails, SurveyQuestion } from "@/services/cia-api";
import type { SurveyFormData } from "@/lib/schemas";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getSurvey as apiGetSurvey,

  getSurveys as apiGetSurveys,
  createSurvey as apiCreateSurvey,
  updateSurvey as apiUpdateSurvey,
  deleteSurvey as apiDeleteSurvey,
  getCampaigns,
  getAllBrands,
  addQuestionToSurvey,
  updateQuestionInSurvey,
  removeQuestionFromSurvey,
} from "@/services/cia-api";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, PlusCircle } from "lucide-react";
import { SurveyDataTable } from "@/components/admin/surveys/SurveyDataTable";
import { SurveyFormDialog } from "@/components/admin/surveys/SurveyFormDialog";
import { DeleteSurveyConfirmationDialog } from "@/components/admin/surveys/DeleteSurveyConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function AdminSurveysPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingSurvey, setDeletingSurvey] = useState<Survey | null>(null);

  const { data: surveys = [], isLoading: isLoadingSurveys, error: surveysError } = useQuery<Survey[], Error>({
    queryKey: ["surveys"],
    queryFn: apiGetSurveys,
  });

  const { data: campaigns = [], isLoading: isLoadingCampaigns, error: campaignsError } = useQuery<Campaign[], Error>({
    queryKey: ["campaigns"],
    queryFn: getCampaigns,
  });

  const { data: brands = [], isLoading: isLoadingBrands, error: brandsError } = useQuery<Brand[], Error>({
    queryKey: ["brands"],
    queryFn: getAllBrands,
  });

  const surveysWithDetails: SurveyWithDetails[] = useMemo(() => {
    if (isLoadingSurveys || isLoadingCampaigns || isLoadingBrands || !surveys || !campaigns || !brands) return [];
    return surveys.map(survey => {
      const campaign = campaigns.find(c => c.id === survey.campaignId);
      const brand = brands.find(b => b.id === survey.brandId);
      const client = campaign ? clients.find(cl => cl.id === campaign.clientId) : undefined;
      return {
        ...survey,
        campaignName: campaign ? campaign.name : "Unknown Campaign",
        brandName: brand ? brand.name : "Unknown Brand",
        clientName: client ? client.name : undefined,
      };
    });
  }, [surveys, campaigns, brands, isLoadingSurveys, isLoadingCampaigns, isLoadingBrands]);
  
  // Dummy clients data for now, replace with actual client fetching if needed for clientName in SurveyWithDetails
  const clients = campaigns.map(c => ({id: c.clientId, name: `Client for ${c.name}`}));


  const createSurveyMutation = useMutation<Survey, Error, SurveyFormData>({
    mutationFn: async (newSurveyData: SurveyFormData) => {
      const payload: CreateSurveyPayload = {
        name: newSurveyData.name,
        campaignId: newSurveyData.campaignId,
        brandId: newSurveyData.brandId,
        status: newSurveyData.status || "draft",
      };
      const createdSurvey = await apiCreateSurvey(payload);
      
      // Add questions one by one
      if (newSurveyData.questions && newSurveyData.questions.length > 0) {
        for (const q of newSurveyData.questions) {
          await addQuestionToSurvey(createdSurvey.id, { text: q.text, type: q.type, options: q.options });
        }
      }
      // Refetch the created survey with questions and ensure it is not null
      const refetchedSurvey = await apiGetSurvey(createdSurvey.id);
      if (!refetchedSurvey) {
        throw new Error("Survey not found after creation");
      }
      return refetchedSurvey;
    },
    onSuccess: (newSurvey) => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      toast({ title: "Survey Created", description: `${newSurvey.name} has been successfully created.` });
      setIsFormOpen(false);
      setEditingSurvey(null);
    },
    onError: (error) => {
      toast({ title: "Error Creating Survey", description: error.message || "Could not create survey.", variant: "destructive" });
    },
  });

  const updateSurveyMutation = useMutation<Survey, Error, SurveyFormData>({
    mutationFn: async (updatedSurveyData) => {
      if (!updatedSurveyData.id) throw new Error("Survey ID is required for update.");
      
      const payload: UpdateSurveyPayload = {
        name: updatedSurveyData.name,
        status: updatedSurveyData.status,
      };
      // Note: campaignId and brandId are not typically updatable after creation in this model.
      // If they are, include them in the payload.
      const updatedSurvey = await apiUpdateSurvey(updatedSurveyData.id, payload);

      // Handle question updates:
      // This is a simplified approach. A more robust solution would compare existing questions
      // with new questions to determine additions, updates, and deletions.
      const existingSurvey = surveys.find(s => s.id === updatedSurveyData.id);
      const existingQuestions = existingSurvey?.questions || [];
      const newQuestions = updatedSurveyData.questions || [];

      // Delete questions not present in new list
      for (const eq of existingQuestions) {
        if (eq.id && !newQuestions.find(nq => nq.id === eq.id)) {
          await removeQuestionFromSurvey(updatedSurvey.id, eq.id);
        }
      }

      // Add or update questions
      for (const nq of newQuestions) {
        if (nq.id) { // Existing question to update
          await updateQuestionInSurvey(updatedSurvey.id, nq.id, { text: nq.text, type: nq.type, options: nq.options });
        } else { // New question to add
           await addQuestionToSurvey(updatedSurvey.id, { text: nq.text, type: nq.type, options: nq.options });
        }
      }
      
      const refetchedSurvey = await apiGetSurvey(updatedSurvey.id); // Refetch to get latest state
      if (!refetchedSurvey) {
        throw new Error("Failed to refetch survey");
      }
      return refetchedSurvey;
    },
    onSuccess: (updatedSurvey) => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      toast({ title: "Survey Updated", description: `${updatedSurvey.name}'s details have been updated.` });
      setIsFormOpen(false);
      setEditingSurvey(null);
    },
    onError: (error) => {
      toast({ title: "Error Updating Survey", description: error.message || "Could not update survey.", variant: "destructive" });
    },
  });


  const deleteSurveyMutation = useMutation<void, Error, string>({
    mutationFn: apiDeleteSurvey,
    onSuccess: (_, deletedSurveyId) => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      const deletedSurveyName = surveys.find(s => s.id === deletedSurveyId)?.name || 'The survey';
      toast({ title: "Survey Deleted", description: `${deletedSurveyName} has been deleted.` });
      setIsDeleteConfirmOpen(false);
      setDeletingSurvey(null);
    },
    onError: (error) => {
      toast({ title: "Error Deleting Survey", description: error.message || "Could not delete survey.", variant: "destructive" });
    },
  });

  const handleAddNewSurvey = () => {
    setEditingSurvey(null);
    setIsFormOpen(true);
  };

  const handleEditSurvey = (survey: Survey) => {
    setEditingSurvey(survey);
    setIsFormOpen(true);
  };

  const handleDeleteSurvey = (survey: Survey) => {
    setDeletingSurvey(survey);
    setIsDeleteConfirmOpen(true);
  };

  const handleFormSubmit = async (data: SurveyFormData) => {
    if (editingSurvey && editingSurvey.id) {
      await updateSurveyMutation.mutateAsync({ ...data, id: editingSurvey.id });
    } else {
      await createSurveyMutation.mutateAsync(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingSurvey && deletingSurvey.id) {
      await deleteSurveyMutation.mutateAsync(deletingSurvey.id);
    }
  };

  const pageActions = (
    <Button onClick={handleAddNewSurvey} className="bg-primary hover:bg-primary/90">
      <PlusCircle className="mr-2 h-4 w-4" /> Add New Survey
    </Button>
  );

  const anyError = surveysError || campaignsError || brandsError;
  if (anyError) {
    return (
      <ProtectedLayout>
        <PageHeader title="Manage Surveys" actions={pageActions} />
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 text-center text-destructive">
          <p>Error loading data: {anyError.message}</p>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <PageHeader title="Manage Surveys" actions={pageActions} />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-2xl">
                <ClipboardList className="mr-3 h-7 w-7 text-primary" />
                Survey Management
              </CardTitle>
              <CardDescription>
                Design, distribute, and analyze surveys for campaigns.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {(isLoadingSurveys || isLoadingCampaigns || isLoadingBrands) && !anyError ? (
              <LoadingSpinner message="Fetching survey data..." containerClassName="py-10" />
            ) : (
              <SurveyDataTable
                surveys={surveysWithDetails}
                isLoading={isLoadingSurveys || isLoadingCampaigns || isLoadingBrands}
                onEditSurvey={handleEditSurvey}
                onDeleteSurvey={handleDeleteSurvey}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <SurveyFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        survey={editingSurvey}
        campaigns={campaigns}
        brands={brands}
        onSubmit={handleFormSubmit}
        isSubmitting={createSurveyMutation.isPending || updateSurveyMutation.isPending}
        isLoadingCampaigns={isLoadingCampaigns}
        isLoadingBrands={isLoadingBrands}
      />

      <DeleteSurveyConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        survey={deletingSurvey}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={deleteSurveyMutation.isPending}
      />
    </ProtectedLayout>
  );
}
