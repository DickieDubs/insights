
"use client";

import type { Brand, Client, CreateBrandPayload, UpdateBrandPayload, BrandWithClientName } from "@/services/cia-api";
import type { BrandFormData } from "@/lib/schemas";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllBrands, 
  createBrand as apiCreateBrand, 
  updateBrand as apiUpdateBrand, 
  deleteBrand as apiDeleteBrand,
  getClients 
} from "@/services/cia-api";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, PlusCircle } from "lucide-react";
import { BrandDataTable } from "@/components/admin/brands/BrandDataTable";
import { BrandFormDialog } from "@/components/admin/brands/BrandFormDialog";
import { DeleteBrandConfirmationDialog } from "@/components/admin/brands/DeleteBrandConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);

  const { data: brands = [], isLoading: isLoadingBrands, error: brandsError } = useQuery<Brand[], Error>({
    queryKey: ["brands"],
    queryFn: getAllBrands,
  });

  const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useQuery<Client[], Error>({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const brandsWithClientNames: BrandWithClientName[] = useMemo(() => {
    if (isLoadingBrands || isLoadingClients || !brands || !clients) return [];
    return brands.map(brand => {
      const client = clients.find(c => c.id === brand.clientId);
      return {
        ...brand,
        clientName: client ? client.name : "Unknown Client"
      };
    });
  }, [brands, clients, isLoadingBrands, isLoadingClients]);


  const createBrandMutation = useMutation<Brand, Error, BrandFormData>({
    mutationFn: (newBrandData: BrandFormData) => {
      const payload: CreateBrandPayload = {
        name: newBrandData.name,
        clientId: newBrandData.clientId,
      };
      return apiCreateBrand(payload);
    },
    onSuccess: (newBrand) => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast({ title: "Brand Created", description: `${newBrand.name} has been successfully added.` });
      setIsFormOpen(false);
      setEditingBrand(null);
    },
    onError: (error) => {
      toast({ title: "Error Creating Brand", description: error.message || "Could not create brand.", variant: "destructive" });
    },
  });

  const updateBrandMutation = useMutation<Brand, Error, BrandFormData>({
    mutationFn: (updatedBrandData) => {
      if (!updatedBrandData.id) throw new Error("Brand ID is required for update.");
      const payload: UpdateBrandPayload = {
        name: updatedBrandData.name,
        // ClientId is not updated after creation as per dialog logic
      };
      return apiUpdateBrand(updatedBrandData.id, payload);
    },
    onSuccess: (updatedBrand) => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast({ title: "Brand Updated", description: `${updatedBrand.name}'s details have been updated.` });
      setIsFormOpen(false);
      setEditingBrand(null);
    },
    onError: (error) => {
      toast({ title: "Error Updating Brand", description: error.message || "Could not update brand.", variant: "destructive" });
    },
  });

  const deleteBrandMutation = useMutation<void, Error, string>({
    mutationFn: apiDeleteBrand,
    onSuccess: (_, deletedBrandId) => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      const deletedBrandName = brands.find(b => b.id === deletedBrandId)?.name || 'The brand';
      toast({ title: "Brand Deleted", description: `${deletedBrandName} has been deleted.` });
      setIsDeleteConfirmOpen(false);
      setDeletingBrand(null);
    },
    onError: (error) => {
      toast({ title: "Error Deleting Brand", description: error.message || "Could not delete brand.", variant: "destructive" });
    },
  });

  const handleAddNewBrand = () => {
    setEditingBrand(null);
    setIsFormOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setIsFormOpen(true);
  };

  const handleDeleteBrand = (brand: Brand) => {
    setDeletingBrand(brand);
    setIsDeleteConfirmOpen(true);
  };

  const handleFormSubmit = async (data: BrandFormData) => {
    if (editingBrand && editingBrand.id) {
      await updateBrandMutation.mutateAsync({ ...data, id: editingBrand.id });
    } else {
      await createBrandMutation.mutateAsync(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingBrand && deletingBrand.id) {
      await deleteBrandMutation.mutateAsync(deletingBrand.id);
    }
  };
  
  const pageActions = (
    <Button onClick={handleAddNewBrand} className="bg-primary hover:bg-primary/90">
      <PlusCircle className="mr-2 h-4 w-4" /> Add New Brand
    </Button>
  );

  if (brandsError || clientsError) {
    const errorToShow = brandsError || clientsError;
    return (
      <ProtectedLayout>
        <PageHeader title="Manage Brands" actions={pageActions}/>
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 text-center text-destructive">
          <p>Error loading data: {errorToShow?.message}</p>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <PageHeader title="Manage Brands" actions={pageActions} />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-2xl">
                <Building className="mr-3 h-7 w-7 text-primary" />
                Brand Management
              </CardTitle>
              <CardDescription>
                View, add, edit, and manage brands associated with clients.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {(isLoadingBrands || isLoadingClients) && !(brandsError || clientsError) ? (
                <LoadingSpinner message="Fetching brand data..." containerClassName="py-10"/>
            ) : (
                <BrandDataTable
                brands={brandsWithClientNames}
                isLoading={isLoadingBrands || isLoadingClients}
                onEditBrand={handleEditBrand}
                onDeleteBrand={handleDeleteBrand}
                />
            )}
          </CardContent>
        </Card>
      </div>

      <BrandFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        brand={editingBrand}
        clients={clients}
        onSubmit={handleFormSubmit}
        isSubmitting={createBrandMutation.isPending || updateBrandMutation.isPending}
        isLoadingClients={isLoadingClients}
      />

      <DeleteBrandConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        brand={deletingBrand}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={deleteBrandMutation.isPending}
      />
    </ProtectedLayout>
  );
}
