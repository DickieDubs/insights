// src/app/consumers/page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { PlusCircle, MoreHorizontal, ArrowLeft, UsersRound, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Consumer } from '@/types';
import { getAllConsumers } from '@/lib/firebase/firestore-service';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 10;

export default function ConsumersPage() {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const fetchedConsumers = await getAllConsumers();
        setConsumers(fetchedConsumers);
      } catch (error) {
        console.error("Error fetching consumers:", error);
        toast({
          variant: 'destructive',
          title: 'Error fetching consumers',
          description: (error as Error).message || 'Could not load consumer data.',
        });
      }
      setIsLoading(false);
    }
    fetchData();
  }, [toast]);

  const filteredConsumers = useMemo(() => {
    return consumers.filter(consumer =>
      consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consumer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (consumer.segment && consumer.segment.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [consumers, searchTerm]);

  const paginatedConsumers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredConsumers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredConsumers, currentPage]);

  const totalPages = Math.ceil(filteredConsumers.length / ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col gap-6 py-6">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
          <UsersRound className="h-6 w-6" /> Consumers
        </h1>
        <Button asChild>
          <Link href="/consumers/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Consumer
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consumer List</CardTitle>
          <CardDescription>Manage your consumer profiles and segments.</CardDescription>
           <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, email, or segment..."
              className="pl-8 w-full md:w-1/3"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : paginatedConsumers.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden sm:table-cell">Segment</TableHead>
                    <TableHead className="hidden lg:table-cell">Surveys Taken</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedConsumers.map((consumer) => (
                    <TableRow key={consumer.id}>
                      <TableCell className="font-medium">
                        <Link href={`/consumers/${consumer.id}`} className="hover:underline text-primary">
                          {consumer.name}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{consumer.email}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {consumer.segment ? <Badge variant="secondary">{consumer.segment}</Badge> : <span className="text-muted-foreground/60">N/A</span>}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{consumer.surveysTaken || 0}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{consumer.lastActive ? new Date(consumer.lastActive).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/consumers/${consumer.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/consumers/${consumer.id}/edit`}>Edit</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-center py-10">
              {searchTerm ? `No consumers found matching "${searchTerm}".` : "No consumers found. Add one to get started!"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
