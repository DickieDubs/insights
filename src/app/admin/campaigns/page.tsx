
"use client";

import type { Campaign, Client, Brand, CreateCampaignPayload, UpdateCampaignPayload, CampaignWithDetails } from "@/services/cia-api";
import type { CampaignFormData } from "@/lib/schemas";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCampaigns as apiGetCampaigns,
  createCampaign as apiCreateCampaign,
  updateCampaign as apiUpdateCampaign,
  deleteCampaign as apiDeleteCampaign,
  getClients,
  getAllBrands,
} from "@/services/cia-api";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, PlusCircle } from "lucide-react";
import { CampaignDataTable } from "@/components/admin/campaigns/CampaignDataTable";
import { CampaignFormDialog } from "@/components/admin/campaigns/CampaignFormDialog";
import { DeleteCampaignConfirmationDialog } from "@/components/admin/campaigns/DeleteCampaignConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function AdminCampaignsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);

  const { data: campaigns = [], isLoading: isLoadingCampaigns, error: campaignsError } = useQuery<Campaign[], Error>({
    queryKey: ["campaigns"],
    queryFn: apiGetCampaigns,
  });

  const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useQuery<Client[], Error>({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const { data: brands = [], isLoading: isLoadingBrands, error: brandsError } = useQuery<Brand[], Error>({
    queryKey: ["brands"],
    queryFn: getAllBrands,
  });

  const campaignsWithDetails: CampaignWithDetails[] = useMemo(() => {
    if (isLoadingCampaigns || isLoadingClients || isLoadingBrands || !campaigns || !clients || !brands) return [];
    return campaigns.map(campaign => {
      const client = clients.find(c => c.id === campaign.clientId);
      const campaignBrands = brands.filter(b => campaign.brandIds.includes(b.id));
      return {
        ...campaign,
        clientName: client ? client.name : "Unknown Client",
        brandNames: campaignBrands.length > 0 ? campaignBrands.map(b => b.name) : ["N/A"]
      };
    });
  }, [campaigns, clients, brands, isLoadingCampaigns, isLoadingClients, isLoadingBrands]);


  const createCampaignMutation = useMutation<Campaign, Error, CampaignFormData>({
    mutationFn: (newCampaignData: CampaignFormData) => {
      const payload: CreateCampaignPayload = {
        name: newCampaignData.name,
        clientId: newCampaignData.clientId,
        brandIds: newCampaignData.brandIds || [],
        rewards: newCampaignData.rewards,
        startDate: newCampaignData.startDate,
        endDate: newCampaignData.endDate,
        status: newCampaignData.status || "draft",
      };
      return apiCreateCampaign(payload);
    },
    onSuccess: (newCampaign) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Campaign Created", description: `${newCampaign.name} has been successfully created.` });
      setIsFormOpen(false);
      setEditingCampaign(null);
    },
    onError: (error) => {
      toast({ title: "Error Creating Campaign", description: error.message || "Could not create campaign.", variant: "destructive" });
    },
  });

  const updateCampaignMutation = useMutation<Campaign, Error, CampaignFormData>({
    mutationFn: (updatedCampaignData) => {
      if (!updatedCampaignData.id) throw new Error("Campaign ID is required for update.");
      const payload: UpdateCampaignPayload = {
        name: updatedCampaignData.name,
        // clientId is not updated after creation
        brandIds: updatedCampaignData.brandIds || [],
        rewards: updatedCampaignData.rewards,
        startDate: updatedCampaignData.startDate,
        endDate: updatedCampaignData.endDate,
        status: updatedCampaignData.status,
      };
      return apiUpdateCampaign(updatedCampaignData.id, payload);
    },
    onSuccess: (updatedCampaign) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Campaign Updated", description: `${updatedCampaign.name}'s details have been updated.` });
      setIsFormOpen(false);
      setEditingCampaign(null);
    },
    onError: (error) => {
      toast({ title: "Error Updating Campaign", description: error.message || "Could not update campaign.", variant: "destructive" });
    },
  });

  const deleteCampaignMutation = useMutation<void, Error, string>({
    mutationFn: apiDeleteCampaign,
    onSuccess: (_, deletedCampaignId) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      const deletedCampaignName = campaigns.find(c => c.id === deletedCampaignId)?.name || 'The campaign';
      toast({ title: "Campaign Deleted", description: `${deletedCampaignName} has been deleted.` });
      setIsDeleteConfirmOpen(false);
      setDeletingCampaign(null);
    },
    onError: (error) => {
      toast({ title: "Error Deleting Campaign", description: error.message || "Could not delete campaign.", variant: "destructive" });
    },
  });

  const handleAddNewCampaign = () => {
    setEditingCampaign(null);
    setIsFormOpen(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsFormOpen(true);
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    setDeletingCampaign(campaign);
    setIsDeleteConfirmOpen(true);
  };

  const handleFormSubmit = async (data: CampaignFormData) => {
    if (editingCampaign && editingCampaign.id) {
      await updateCampaignMutation.mutateAsync({ ...data, id: editingCampaign.id });
    } else {
      await createCampaignMutation.mutateAsync(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingCampaign && deletingCampaign.id) {
      await deleteCampaignMutation.mutateAsync(deletingCampaign.id);
    }
  };

  const pageActions = (
    <Button onClick={handleAddNewCampaign} className="bg-primary hover:bg-primary/90">
      <PlusCircle className="mr-2 h-4 w-4" /> Add New Campaign
    </Button>
  );

  const anyError = campaignsError || clientsError || brandsError;
  if (anyError) {
    return (
      <ProtectedLayout>
        <PageHeader title="Manage Campaigns" actions={pageActions} />
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 text-center text-destructive">
          <p>Error loading data: {anyError.message}</p>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <PageHeader title="Manage Campaigns" actions={pageActions} />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-2xl">
                <Briefcase className="mr-3 h-7 w-7 text-primary" />
                Campaign Management
              </CardTitle>
              <CardDescription>
                Create, monitor, and manage marketing campaigns.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {(isLoadingCampaigns || isLoadingClients || isLoadingBrands) && !anyError ? (
              <LoadingSpinner message="Fetching campaign data..." containerClassName="py-10" />
            ) : (
              <CampaignDataTable
                campaigns={campaignsWithDetails}
                isLoading={isLoadingCampaigns || isLoadingClients || isLoadingBrands}
                onEditCampaign={handleEditCampaign}
                onDeleteCampaign={handleDeleteCampaign}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <CampaignFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        campaign={editingCampaign}
        clients={clients}
        brands={brands}
        onSubmit={handleFormSubmit}
        isSubmitting={createCampaignMutation.isPending || updateCampaignMutation.isPending}
        isLoadingClients={isLoadingClients}
        isLoadingBrands={isLoadingBrands}
      />

      <DeleteCampaignConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        campaign={deletingCampaign}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={deleteCampaignMutation.isPending}
      />
    </ProtectedLayout>
  );
}
