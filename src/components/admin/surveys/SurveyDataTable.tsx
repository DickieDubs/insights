
"use client";

import type { SurveyWithDetails } from "@/services/cia-api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, FileText } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/ui/badge";

interface SurveyDataTableProps {
  surveys: SurveyWithDetails[];
  isLoading: boolean;
  onEditSurvey: (survey: SurveyWithDetails) => void;
  onDeleteSurvey: (survey: SurveyWithDetails) => void;
  // onManageQuestions: (survey: SurveyWithDetails) => void; // Future: To manage questions for a survey
}

export function SurveyDataTable({
  surveys,
  isLoading,
  onEditSurvey,
  onDeleteSurvey,
  // onManageQuestions,
}: SurveyDataTableProps) {
  if (isLoading) {
    return <LoadingSpinner message="Loading surveys..." containerClassName="p-8" />;
  }

  if (!Array.isArray(surveys) || surveys.length === 0) {
    return <p className="p-8 text-center text-muted-foreground">No surveys found. Add a new survey to get started.</p>;
  }

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'closed':
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Survey Name</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.map((survey) => (
            <TableRow key={survey.id}>
              <TableCell className="font-medium">{survey.name}</TableCell>
              <TableCell>{survey.campaignName || "N/A"}</TableCell>
              <TableCell>{survey.brandName || "N/A"}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusVariant(survey.status)}>
                  {survey.status ? survey.status.charAt(0).toUpperCase() + survey.status.slice(1) : "N/A"}
                </Badge>
              </TableCell>
              <TableCell>{survey.questions?.length || 0}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* <DropdownMenuItem onClick={() => onManageQuestions(survey)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Manage Questions
                    </DropdownMenuItem> */}
                    <DropdownMenuItem onClick={() => onEditSurvey(survey)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteSurvey(survey)}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
