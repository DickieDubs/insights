
"use client";

import type { Survey, Campaign, Brand, SurveyQuestion } from "@/services/cia-api";
import type { SurveyFormData, SurveyQuestionFormData, SurveyQuestionType } from "@/lib/schemas";
import { SurveySchema, SurveyQuestionSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, PlusCircle, Trash2, GripVertical } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SurveyFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  survey?: Survey | null;
  campaigns: Campaign[];
  brands: Brand[]; // All brands, will be filtered
  onSubmit: (data: SurveyFormData) => Promise<void>;
  isSubmitting: boolean;
  isLoadingCampaigns: boolean;
  isLoadingBrands: boolean;
}

const generateTempId = () => `temp_${Math.random().toString(36).substr(2, 9)}`;

export function SurveyFormDialog({
  isOpen,
  onOpenChange,
  survey,
  campaigns,
  brands,
  onSubmit,
  isSubmitting,
  isLoadingCampaigns,
  isLoadingBrands,
}: SurveyFormDialogProps) {
  const form = useForm<SurveyFormData>({
    resolver: zodResolver(SurveySchema),
    defaultValues: survey
      ? {
          id: survey.id,
          name: survey.name,
          campaignId: survey.campaignId,
          brandId: survey.brandId,
          status: survey.status || "draft",
          questions: survey.questions?.map(q => ({ ...q, tempId: q.id || generateTempId() })) || [],
        }
      : {
          name: "",
          campaignId: "",
          brandId: "",
          status: "draft",
          questions: [],
        },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "questions",
    keyName: "fieldId", // to avoid conflict with 'id' from SurveyQuestion
  });

  const selectedCampaignId = form.watch("campaignId");
  const selectedCampaign = useMemo(() => campaigns.find(c => c.id === selectedCampaignId), [selectedCampaignId, campaigns]);
  
  const availableBrandsForCampaign = useMemo(() => {
    if (!selectedCampaign || isLoadingBrands) return [];
    return brands.filter(brand => selectedCampaign.brandIds.includes(brand.id));
  }, [selectedCampaign, brands, isLoadingBrands]);


  useEffect(() => {
    if (isOpen) {
      if (survey) {
        form.reset({
          id: survey.id,
          name: survey.name,
          campaignId: survey.campaignId,
          brandId: survey.brandId,
          status: survey.status || "draft",
          questions: survey.questions?.map(q => ({ ...q, tempId: q.id || generateTempId(), options: q.options || [] })) || [],
        });
      } else {
        form.reset({
          name: "",
          campaignId: "",
          brandId: "",
          status: "draft",
          questions: [],
        });
      }
    }
  }, [survey, form, isOpen]);

  // Reset brandId if campaign changes and it's not the initial load for an existing survey
  useEffect(() => {
    if (isOpen && form.formState.dirtyFields.campaignId && (!survey || form.getValues("campaignId") !== survey.campaignId)) {
        form.setValue("brandId", "", { shouldValidate: true });
    }
  }, [selectedCampaignId, survey, form, isOpen]);


  const handleFormSubmit = async (data: SurveyFormData) => {
    // Filter out empty options for multiple-choice questions before submission
    const processedData = {
      ...data,
      questions: data.questions?.map(q => ({
        ...q,
        options: q.type === 'multiple-choice' ? q.options?.filter(opt => opt.trim() !== "") : undefined,
      }))
    };
    await onSubmit(processedData);
  };

  const addQuestion = () => {
    append({ tempId: generateTempId(), text: "", type: "multiple-choice", options: ["", ""] });
  };
  
  const addOption = (questionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
    form.setValue(`questions.${questionIndex}.options`, [...currentOptions, ""]);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
    form.setValue(`questions.${questionIndex}.options`, currentOptions.filter((_, i) => i !== optionIndex));
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) form.reset();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{survey ? "Edit Survey" : "Add New Survey"}</DialogTitle>
          <DialogDescription>
            {survey
              ? "Update the survey's details and questions."
              : "Fill in the form to create a new survey."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 flex-grow flex flex-col min-h-0">
            <ScrollArea className="flex-grow pr-6 -mr-6 pb-4">
              <div className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Survey Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Customer Satisfaction Q3" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="campaignId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                        disabled={isSubmitting || isLoadingCampaigns}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingCampaigns ? "Loading campaigns..." : "Select a campaign"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCampaigns ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                          ) : (
                            campaigns.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting || isLoadingBrands || !selectedCampaignId || availableBrandsForCampaign.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              isLoadingBrands && selectedCampaignId ? "Loading brands..." : 
                              !selectedCampaignId ? "Select campaign first" :
                              availableBrandsForCampaign.length === 0 ? "No brands for campaign" :
                              "Select a brand"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(isLoadingBrands && selectedCampaignId) && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                          {availableBrandsForCampaign.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select survey status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Questions Section */}
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Questions</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addQuestion} disabled={isSubmitting}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                  </div>
                   {fields.length === 0 && <p className="text-sm text-muted-foreground">No questions added yet.</p>}
                  {fields.map((field, index) => (
                    <Card key={field.fieldId} className="p-4 space-y-3 bg-muted/30 shadow-sm">
                      <div className="flex items-start gap-2">
                        {/* <Button type="button" variant="ghost" size="icon" className="cursor-grab p-1 h-auto mt-1" title="Drag to reorder (not implemented)">
                          <GripVertical className="h-4 w-4" />
                        </Button> */}
                         <span className="text-sm font-semibold p-2 mt-1.5">{index + 1}.</span>
                        <div className="flex-grow space-y-2">
                          <FormField
                            control={form.control}
                            name={`questions.${index}.text`}
                            render={({ field: qField }) => (
                              <FormItem>
                                <FormLabel className="sr-only">Question Text</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Enter question text" {...qField} disabled={isSubmitting} className="bg-background"/>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-center gap-4">
                            <FormField
                              control={form.control}
                              name={`questions.${index}.type`}
                              render={({ field: typeField }) => (
                                <FormItem className="flex-grow">
                                  <FormLabel className="sr-only">Question Type</FormLabel>
                                  <Select
                                    onValueChange={(value) => {
                                      typeField.onChange(value as SurveyQuestionType);
                                      if (value === 'multiple-choice' && (!form.getValues(`questions.${index}.options`) || form.getValues(`questions.${index}.options`)?.length === 0) ) {
                                          form.setValue(`questions.${index}.options`, ["", ""]);
                                      } else if (value !== 'multiple-choice') {
                                          form.setValue(`questions.${index}.options`, undefined);
                                      }
                                    }}
                                    value={typeField.value}
                                    disabled={isSubmitting}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Select question type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                      <SelectItem value="open-ended">Open-ended Text</SelectItem>
                                      <SelectItem value="rating">Rating (1-5)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                             <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={isSubmitting} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove Question</span>
                            </Button>
                          </div>

                          {form.watch(`questions.${index}.type`) === 'multiple-choice' && (
                            <div className="space-y-2 pl-6">
                              <FormLabel className="text-sm">Options</FormLabel>
                              {(form.watch(`questions.${index}.options`) || []).map((_, optIndex) => (
                                <FormField
                                  key={`${field.fieldId}-option-${optIndex}`}
                                  control={form.control}
                                  name={`questions.${index}.options.${optIndex}`}
                                  render={({ field: optField }) => (
                                    <FormItem className="flex items-center gap-2">
                                      <FormControl>
                                        <Input placeholder={`Option ${optIndex + 1}`} {...optField} disabled={isSubmitting} className="bg-background"/>
                                      </FormControl>
                                      { (form.getValues(`questions.${index}.options`)?.length ?? 0) > 2 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index, optIndex)} disabled={isSubmitting} className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-auto">
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      )}
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              ))}
                              <Button type="button" variant="outline" size="sm" onClick={() => addOption(index)} disabled={isSubmitting} className="mt-1">
                                <PlusCircle className="mr-2 h-3 w-3" /> Add Option
                              </Button>
                               <FormMessage>{(form.formState.errors.questions?.[index]?.options as any)?.message}</FormMessage>
                               <FormMessage>{(form.formState.errors.questions?.[index]?.options?.[0] as any)?.root?.message}</FormMessage>


                            </div>
                          )}
                           <FormMessage>{(form.formState.errors.questions?.[index] as any)?.options?.message}</FormMessage>
                        </div>
                       
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 mt-auto sticky bottom-0 bg-background pb-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoadingCampaigns || isLoadingBrands}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {survey ? "Save Changes" : "Create Survey"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";
