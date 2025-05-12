
"use client";

import type { CampaignWithDetails } from "@/services/cia-api";
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
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils"; // Assuming you have a date formatting utility

interface CampaignDataTableProps {
  campaigns: CampaignWithDetails[];
  isLoading: boolean;
  onEditCampaign: (campaign: CampaignWithDetails) => void;
  onDeleteCampaign: (campaign: CampaignWithDetails) => void;
  // onViewCampaign?: (campaign: CampaignWithDetails) => void; // Optional: if you want a dedicated view action
}

export function CampaignDataTable({
  campaigns,
  isLoading,
  onEditCampaign,
  onDeleteCampaign,
  // onViewCampaign,
}: CampaignDataTableProps) {
  if (isLoading) {
    return <LoadingSpinner message="Loading campaigns..." containerClassName="p-8" />;
  }

  if (!Array.isArray(campaigns) || campaigns.length === 0) {
    return <p className="p-8 text-center text-muted-foreground">No campaigns found. Add a new campaign to get started.</p>;
  }

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Brands</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>{campaign.clientName || "N/A"}</TableCell>
              <TableCell>{campaign.brandNames?.join(', ') || "N/A"}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusVariant(campaign.status)}>
                  {campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : "N/A"}
                </Badge>
              </TableCell>
              <TableCell>{campaign.startDate ? formatDate(campaign.startDate) : "N/A"}</TableCell>
              <TableCell>{campaign.endDate ? formatDate(campaign.endDate) : "N/A"}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* {onViewCampaign && (
                      <DropdownMenuItem onClick={() => onViewCampaign(campaign)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                    )} */}
                    <DropdownMenuItem onClick={() => onEditCampaign(campaign)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteCampaign(campaign)}
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
