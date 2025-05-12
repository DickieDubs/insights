
"use client";

import type { Survey } from "@/services/cia-api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DeleteSurveyConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  survey: Survey | null;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteSurveyConfirmationDialog({
  isOpen,
  onOpenChange,
  survey,
  onConfirmDelete,
  isDeleting,
}: DeleteSurveyConfirmationDialogProps) {
  if (!survey) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this survey?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the survey
            <span className="font-semibold"> {survey.name}</span> and all its associated questions and responses.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Survey
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
