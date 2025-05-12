"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, FileText, Users, TrendingUp, Server } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  getSurveys as apiGetSurveys,
  getSystemReport,
  getDemographicReport,
  // getBrandInsightsReport, // This uses the same endpoint as demographic as per instructions
  getSurveyAnalysisReport,
  getSurveyInsightsReport
} from "@/services/cia-api";
import type { Survey, Report } from "@/services/cia-api";

function ReportDisplayCard({ title, icon: Icon, data, isLoading, error, noDataMessage = "No data available for this report." }: { title: string; icon: React.ElementType; data: Report | null | undefined; isLoading: boolean; error: Error | null; noDataMessage?: string }) {
  
  const reportPayload = data?.data; // The actual content/payload of the report
  const hasMeaningfulData = React.useMemo(() => {
    if (!reportPayload) return false;
    if (Array.isArray(reportPayload)) return reportPayload.length > 0;
    if (typeof reportPayload === 'object' && reportPayload !== null) return Object.keys(reportPayload).length > 0;
    // For primitive types (string, number, boolean), consider them meaningful if they exist and are not just empty strings
    if (typeof reportPayload === 'string') return reportPayload.trim() !== "";
    return reportPayload !== undefined && reportPayload !== null;
  }, [reportPayload]);

  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Icon className="mr-2 h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <LoadingSpinner message="Loading report data..." />}
        {error && <Alert variant="destructive">
            <AlertTitle>Error loading report</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>}
        {!isLoading && !error && !hasMeaningfulData && <p className="text-muted-foreground">{noDataMessage}</p>}
        {!isLoading && !error && hasMeaningfulData && (
          <pre className="mt-2 w-full whitespace-pre-wrap break-all rounded-md bg-muted p-4 text-sm max-h-96 overflow-auto">
            {JSON.stringify(reportPayload, null, 2)}
          </pre>
        )}
         {/* Placeholder for future chart */}
         {!isLoading && !error && hasMeaningfulData && (
            <div className="mt-4 p-4 border border-dashed rounded-md text-center text-muted-foreground">
              Chart placeholder for {title}.
            </div>
          )}
      </CardContent>
    </Card>
  );
}


export default function AdminReportsPage() {
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

  const { data: surveys = [], isLoading: isLoadingSurveys, error: surveysError } = useQuery<Survey[], Error>({
    queryKey: ["surveysForAllReports"],
    queryFn: apiGetSurveys,
  });

  const { data: systemReport, isLoading: isLoadingSystemReport, error: systemReportError } = useQuery<Report | null, Error>({
    queryKey: ["systemReport"],
    queryFn: getSystemReport,
  });

  const { data: demographicReport, isLoading: isLoadingDemographicReport, error: demographicReportError } = useQuery<Report | null, Error>({
    queryKey: ["demographicReport", selectedSurveyId],
    queryFn: () => getDemographicReport(selectedSurveyId!),
    enabled: !!selectedSurveyId,
  });

  // Using demographic endpoint for brand insights as per instructions
  const { data: brandInsightsReport, isLoading: isLoadingBrandInsightsReport, error: brandInsightsReportError } = useQuery<Report | null, Error>({
    queryKey: ["brandInsightsReport", selectedSurveyId],
    queryFn: () => getDemographicReport(selectedSurveyId!), // Uses demographic endpoint
    enabled: !!selectedSurveyId,
  });
  
  const { data: surveyAnalysisReport, isLoading: isLoadingSurveyAnalysisReport, error: surveyAnalysisReportError } = useQuery<Report | null, Error>({
    queryKey: ["surveyAnalysisReport", selectedSurveyId],
    queryFn: () => getSurveyAnalysisReport(selectedSurveyId!),
    enabled: !!selectedSurveyId,
  });

  const { data: surveyInsightsReport, isLoading: isLoadingSurveyInsightsReport, error: surveyInsightsReportError } = useQuery<Report | null, Error>({
    queryKey: ["surveyInsightsReport", selectedSurveyId],
    queryFn: () => getSurveyInsightsReport(selectedSurveyId!),
    enabled: !!selectedSurveyId,
  });


  return (
    <ProtectedLayout>
      <PageHeader title="View Reports" />
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <BarChart3 className="mr-3 h-7 w-7 text-primary" />
              Reporting Dashboard
            </CardTitle>
            <CardDescription>
              Access and generate detailed reports. Select a survey to view specific reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="max-w-sm space-y-2">
              <Label htmlFor="survey-select">Select Survey for Detailed Reports</Label>
              <Select
                value={selectedSurveyId || ""}
                onValueChange={(value) => setSelectedSurveyId(value === "none" ? null : value)}
                disabled={isLoadingSurveys}
              >
                <SelectTrigger id="survey-select" className="w-full">
                  <SelectValue placeholder={isLoadingSurveys ? "Loading surveys..." : "Select a survey"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Show only system-wide reports)</SelectItem>
                  {surveysError && <SelectItem value="error" disabled>Error loading surveys</SelectItem>}
                  {!isLoadingSurveys && surveys.map((survey) => (
                    <SelectItem key={survey.id} value={survey.id}>
                      {survey.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {surveysError && <p className="text-sm text-destructive">{surveysError.message}</p>}
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              <ReportDisplayCard
                title="System-Wide Report"
                icon={Server}
                data={systemReport}
                isLoading={isLoadingSystemReport}
                error={systemReportError}
                noDataMessage="No system-wide data available or an error occurred."
              />

              {selectedSurveyId && (
                <>
                  <ReportDisplayCard
                    title="Demographic Report"
                    icon={Users}
                    data={demographicReport}
                    isLoading={isLoadingDemographicReport}
                    error={demographicReportError}
                    noDataMessage="No demographic data for selected survey."
                  />
                  <ReportDisplayCard
                    title="Brand Insights Report"
                    icon={TrendingUp}
                    data={brandInsightsReport} // Uses demographic endpoint
                    isLoading={isLoadingBrandInsightsReport}
                    error={brandInsightsReportError}
                    noDataMessage="No brand insights data for selected survey (uses demographic data)."
                  />
                  <ReportDisplayCard
                    title="Survey Analysis Report"
                    icon={FileText}
                    data={surveyAnalysisReport}
                    isLoading={isLoadingSurveyAnalysisReport}
                    error={surveyAnalysisReportError}
                    noDataMessage="No analysis data for selected survey."
                  />
                   <ReportDisplayCard
                    title="Survey Insights Report"
                    icon={BarChart3} 
                    data={surveyInsightsReport}
                    isLoading={isLoadingSurveyInsightsReport}
                    error={surveyInsightsReportError}
                    noDataMessage="No general insights data for selected survey."
                  />
                </>
              )}
            </div>
             {!selectedSurveyId && (
                <Alert className="mt-6">
                  <AlertTitle>Select a Survey</AlertTitle>
                  <AlertDescription>
                    Please select a survey from the dropdown above to view detailed demographic, brand, analysis, and insights reports.
                  </AlertDescription>
                </Alert>
              )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}

