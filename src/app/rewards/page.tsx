
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Gift, PlusCircle, ArrowLeft, Edit3, Save, Loader2 } from 'lucide-react'; // Removed Trash2, Eye
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import type { RewardProgram, RedemptionItem } from '@/types';
import {
    addRewardProgram, getAllRewardPrograms, updateRewardProgram, deleteRewardProgram,
    addRedemptionItem, getAllRedemptionItems, updateRedemptionItem, deleteRedemptionItem
} from '@/lib/firebase/firestore-service';
import { Timestamp } from 'firebase/firestore';

// Mock data for recent redemptions - this would typically come from a 'redemptions' collection
const recentRedemptions = [
  { id: 'red_1', userId: 'user_abc', userName: 'John D.', reward: '$10 Amazon Card', pointsCost: 100, date: '2024-04-28' },
  { id: 'red_2', userId: 'user_xyz', userName: 'Jane S.', reward: '20% Off Coupon - SnackCo', pointsCost: 50, date: '2024-04-25' },
];


export default function RewardsPage() {
  const [rewardsPrograms, setRewardsPrograms] = useState<RewardProgram[]>([]);
  const [redemptionItems, setRedemptionItems] = useState<RedemptionItem[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<Partial<RewardProgram> | null>(null);
  const [currentItem, setCurrentItem] = useState<Partial<RedemptionItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoadingPrograms(true);
      setIsLoadingItems(true);
      try {
        const [programs, items] = await Promise.all([
          getAllRewardPrograms(),
          getAllRedemptionItems()
        ]);
        setRewardsPrograms(programs);
        setRedemptionItems(items);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error Loading Data', description: (error as Error).message });
      }
      setIsLoadingPrograms(false);
      setIsLoadingItems(false);
    }
    loadData();
  }, [toast]);

  const handleOpenProgramModal = (program?: RewardProgram) => {
    setCurrentProgram(program ? { ...program, config: program.config || {} } : { name: '', type: 'Points', status: 'Draft', description: '', config: {} });
    setIsProgramModalOpen(true);
  };

  const handleOpenItemModal = (item?: RedemptionItem) => {
    setCurrentItem(item || { name: '', type: 'Gift Card', isActive: true, pointsCost: 0, stock: null });
    setIsItemModalOpen(true);
  }

  const handleSaveProgram = async () => {
    if (!currentProgram || !currentProgram.name || !currentProgram.type || !currentProgram.status) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'Program name, type, and status are required.' });
        return;
    }
    setIsSaving(true);
    
    try {
      const programDataToSave = { ...currentProgram } as Omit<RewardProgram, 'id' | 'createdAt' | 'updatedAt'>;
      // Ensure config is an object, even if empty
      programDataToSave.config = programDataToSave.config || {};


      if (currentProgram.id) { 
        await updateRewardProgram(currentProgram.id, programDataToSave);
        setRewardsPrograms(prev => prev.map(p => p.id === currentProgram!.id ? { ...p, ...programDataToSave, updatedAt: Timestamp.now() } as RewardProgram : p));
        toast({ title: 'Program Updated', description: `"${currentProgram.name}" has been updated.` });
      } else { 
        const newProgramId = await addRewardProgram(programDataToSave);
        setRewardsPrograms(prev => [...prev, { ...programDataToSave, id: newProgramId, createdAt: Timestamp.now(), updatedAt: Timestamp.now() }]);
        toast({ title: 'Program Created', description: `"${programDataToSave.name}" has been created.` });
      }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error Saving Program', description: (error as Error).message });
    }
    setIsSaving(false);
    setIsProgramModalOpen(false);
    setCurrentProgram(null);
  };

  const handleSaveItem = async () => {
    if (!currentItem || !currentItem.name || !currentItem.type) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'Item name and type are required.' });
        return;
    }
    setIsSaving(true);
    
    try {
        const itemDataToSave = { ...currentItem } as Omit<RedemptionItem, 'id' | 'createdAt' | 'updatedAt'>;
        // Ensure pointsCost is a number or undefined, stock is number or null
        itemDataToSave.pointsCost = itemDataToSave.pointsCost ? Number(itemDataToSave.pointsCost) : undefined;
        itemDataToSave.stock = itemDataToSave.stock === undefined || itemDataToSave.stock === null ? null : Number(itemDataToSave.stock);


        if (currentItem.id) {
            await updateRedemptionItem(currentItem.id, itemDataToSave);
            setRedemptionItems(prev => prev.map(i => i.id === currentItem!.id ? { ...i, ...itemDataToSave, updatedAt: Timestamp.now() } as RedemptionItem : i));
            toast({ title: 'Item Updated', description: `"${currentItem.name}" has been updated.` });
        } else {
            const newItemId = await addRedemptionItem(itemDataToSave);
            setRedemptionItems(prev => [...prev, { ...itemDataToSave, id: newItemId, createdAt: Timestamp.now(), updatedAt: Timestamp.now() }]);
            toast({ title: 'Item Added', description: `"${itemDataToSave.name}" has been added.` });
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error Saving Item', description: (error as Error).message });
    }
    setIsSaving(false);
    setIsItemModalOpen(false);
    setCurrentItem(null);
  };
  
  const handleDeleteProgram = async (programId: string) => {
    if (!window.confirm("Are you sure you want to delete this reward program? This action cannot be undone.")) return;
    setIsSaving(true); // Use generic saving loader
    try {
        await deleteRewardProgram(programId);
        setRewardsPrograms(prev => prev.filter(p => p.id !== programId));
        toast({ title: 'Program Deleted', description: 'Reward program has been successfully deleted.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Deletion Failed', description: (error as Error).message });
    }
    setIsSaving(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this redemption item? This action cannot be undone.")) return;
    setIsSaving(true); // Use generic saving loader
    try {
        await deleteRedemptionItem(itemId);
        setRedemptionItems(prev => prev.filter(i => i.id !== itemId));
        toast({ title: 'Item Deleted', description: 'Redemption item has been successfully deleted.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Deletion Failed', description: (error as Error).message });
    }
    setIsSaving(false);
  };


  return (
    <div className="flex flex-col gap-6 py-6">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
          <Award className="h-6 w-6" /> Rewards Management
        </h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Reward Programs</CardTitle>
            <CardDescription>Manage incentives for survey participation.</CardDescription>
          </div>
          <Button onClick={() => handleOpenProgramModal()} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Program
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingPrograms ? <div className="flex justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div> : 
          rewardsPrograms.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewardsPrograms.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">{program.name}</TableCell>
                    <TableCell>{program.type}</TableCell>
                    <TableCell>
                      <Badge variant={program.status === 'Active' ? 'default' : 'outline'}
                        className={`${program.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : program.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} border-transparent`}>
                        {program.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                      {program.type === 'Points' && `${program.config.pointsPerSurvey || 'N/A'} pts/survey`}
                      {program.type === 'Raffle' && `${program.config.entryPerSurvey || 'N/A'} entry/survey`}
                      {program.type === 'Bonus' && `${program.config.bonusAmount || 'N/A'} (${program.config.condition || 'N/A'})`}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenProgramModal(program)} className="h-8 w-8">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProgram(program.id)} className="h-8 w-8 text-destructive hover:text-destructive/80" disabled={isSaving}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No reward programs created yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Redemption Catalog</CardTitle>
            <CardDescription>Define items or rewards users can redeem.</CardDescription>
          </div>
           <Button onClick={() => handleOpenItemModal()} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </CardHeader>
        <CardContent>
           {isLoadingItems ? <div className="flex justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div> :
           redemptionItems.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Points Cost</TableHead>
                        <TableHead className="hidden sm:table-cell">Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {redemptionItems.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.type}</TableCell>
                            <TableCell>{item.pointsCost !== undefined ? item.pointsCost : 'N/A'}</TableCell>
                            <TableCell className="hidden sm:table-cell">{item.stock !== undefined && item.stock !== null ? item.stock : 'Unlimited'}</TableCell>
                            <TableCell>
                                <Badge variant={item.isActive ? 'default' : 'outline'}
                                 className={`${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} border-transparent`}>
                                    {item.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenItemModal(item)}  className="h-8 w-8">
                                    <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="h-8 w-8 text-destructive hover:text-destructive/80" disabled={isSaving}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
           ) : (
             <p className="text-muted-foreground text-center py-4">No items in the redemption catalog yet.</p>
           )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Redemptions (Placeholder)</CardTitle>
          <CardDescription>Track rewards claimed by users. (Functionality to be implemented)</CardDescription>
        </CardHeader>
        <CardContent>
          {recentRedemptions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Points Cost</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRedemptions.map((redemption) => (
                  <TableRow key={redemption.id}>
                    <TableCell>{redemption.userName} <span className="text-xs text-muted-foreground">({redemption.userId})</span></TableCell>
                    <TableCell>{redemption.reward}</TableCell>
                    <TableCell className="text-muted-foreground">{redemption.pointsCost}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{redemption.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No recent redemptions.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isProgramModalOpen} onOpenChange={setIsProgramModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentProgram?.id ? 'Edit' : 'Create'} Reward Program</DialogTitle>
            <DialogDescription>
              Define the details for this reward program.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="programName" className="text-right">Name*</Label>
              <Input id="programName" value={currentProgram?.name || ''} onChange={(e) => setCurrentProgram(p => ({ ...p, name: e.target.value }))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="programType" className="text-right">Type*</Label>
              <Select value={currentProgram?.type || undefined} onValueChange={(value) => setCurrentProgram(p => ({ ...p, type: value as RewardProgram['type'] }))}>
                  <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type"/>
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Points">Points</SelectItem>
                      <SelectItem value="Raffle">Raffle</SelectItem>
                      <SelectItem value="Bonus">Bonus</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="programStatus" className="text-right">Status*</Label>
               <Select value={currentProgram?.status || undefined} onValueChange={(value) => setCurrentProgram(p => ({ ...p, status: value as RewardProgram['status'] }))}>
                  <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status"/>
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="programDescription" className="text-right">Description</Label>
              <Textarea id="programDescription" value={currentProgram?.description || ''} onChange={(e) => setCurrentProgram(p => ({ ...p, description: e.target.value }))} className="col-span-3" placeholder="Briefly describe the program" />
            </div>
            {currentProgram?.type === 'Points' && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pointsPerSurvey" className="text-right">Points/Survey</Label>
                    <Input id="pointsPerSurvey" type="number" value={currentProgram.config?.pointsPerSurvey || ''} onChange={(e) => setCurrentProgram(p => ({...p, config: {...p?.config, pointsPerSurvey: parseInt(e.target.value) || 0 }}))} className="col-span-3" />
                </div>
            )}
            {currentProgram?.type === 'Raffle' && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="entryPerSurvey" className="text-right">Entries/Survey</Label>
                    <Input id="entryPerSurvey" type="number" value={currentProgram.config?.entryPerSurvey || ''} onChange={(e) => setCurrentProgram(p => ({...p, config: {...p?.config, entryPerSurvey: parseInt(e.target.value) || 0 }}))} className="col-span-3" />
                </div>
            )}
             {currentProgram?.type === 'Bonus' && (
                <>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bonusAmount" className="text-right">Bonus Value</Label>
                        <Input id="bonusAmount" value={currentProgram.config?.bonusAmount || ''} onChange={(e) => setCurrentProgram(p => ({...p, config: {...p?.config, bonusAmount: e.target.value }}))} className="col-span-3" placeholder="e.g., $5 Coupon, Extra Points"/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bonusCondition" className="text-right">Condition</Label>
                        <Input id="bonusCondition" value={currentProgram.config?.condition || ''} onChange={(e) => setCurrentProgram(p => ({...p, config: {...p?.config, condition: e.target.value }}))} className="col-span-3" placeholder="e.g., First 100 respondents"/>
                    </div>
                </>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSaving}>Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveProgram} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Program
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentItem?.id ? 'Edit' : 'Add'} Redemption Item</DialogTitle>
            <DialogDescription>
              Define an item available in the redemption catalog.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemName" className="text-right">Item Name*</Label>
              <Input id="itemName" value={currentItem?.name || ''} onChange={(e) => setCurrentItem(i => ({ ...i, name: e.target.value }))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemType" className="text-right">Item Type*</Label>
              <Select value={currentItem?.type || undefined} onValueChange={(value) => setCurrentItem(i => ({ ...i, type: value as RedemptionItem['type'] }))}>
                  <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select item type"/>
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Gift Card">Gift Card</SelectItem>
                      <SelectItem value="Coupon">Coupon</SelectItem>
                      <SelectItem value="Merchandise">Merchandise</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemPointsCost" className="text-right">Points Cost</Label>
              <Input id="itemPointsCost" type="number" value={currentItem?.pointsCost === undefined ? '' : String(currentItem.pointsCost)} onChange={(e) => setCurrentItem(i => ({ ...i, pointsCost: e.target.value === '' ? undefined : parseInt(e.target.value) }))} className="col-span-3" placeholder="Optional (e.g., 100)"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemStock" className="text-right">Stock</Label>
              <Input id="itemStock" type="number" value={currentItem?.stock === undefined || currentItem.stock === null ? '' : String(currentItem.stock)} onChange={(e) => setCurrentItem(i => ({ ...i, stock: e.target.value === '' ? null : parseInt(e.target.value) }))} className="col-span-3" placeholder="Optional (blank for unlimited)"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemIsActive" className="text-right">Status</Label>
                <div className="col-span-3 flex items-center space-x-2">
                     <Select value={currentItem?.isActive === undefined ? "true" : String(currentItem.isActive)} onValueChange={(value) => setCurrentItem(i => ({ ...i, isActive: value === "true" }))}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select status"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemDescription" className="text-right">Description</Label>
              <Textarea id="itemDescription" value={currentItem?.description || ''} onChange={(e) => setCurrentItem(i => ({ ...i, description: e.target.value }))} className="col-span-3" placeholder="Optional item description"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemImageUrl" className="text-right">Image URL</Label>
              <Input id="itemImageUrl" value={currentItem?.imageUrl || ''} onChange={(e) => setCurrentItem(i => ({ ...i, imageUrl: e.target.value }))} className="col-span-3" placeholder="Optional image URL"/>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSaving}>Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveItem} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
