"use client";

import type { BrandWithClientName, Client } from "@/services/cia-api";
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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface BrandDataTableProps {
  brands: BrandWithClientName[];
  isLoading: boolean;
  onEditBrand: (brand: BrandWithClientName) => void;
  onDeleteBrand: (brand: BrandWithClientName) => void;
}

export function BrandDataTable({
  brands,
  isLoading,
  onEditBrand,
  onDeleteBrand,
}: BrandDataTableProps) {
  if (isLoading) {
    return <LoadingSpinner message="Loading brands..." containerClassName="p-8" />;
  }

  if (!Array.isArray(brands) || brands.length === 0) {
    return <p className="p-8 text-center text-muted-foreground">No brands found. Add a new brand to get started.</p>;
  }

  return (
    <div className="rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Brand Name</TableHead>
            <TableHead>Associated Client</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell className="font-medium">{brand.name}</TableCell>
              <TableCell>{brand.clientName || brand.clientId}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditBrand(brand)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteBrand(brand)}
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
