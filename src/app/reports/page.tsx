
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePieChart, Download, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { 
    getAllCampaigns, // For campaign filter
    getAllSurveys,   // For survey filter
    getMockReportTypes, // Keep mock for report types for now
} from '@/lib/firebase/firestore-service';
import type { Campaign, Survey } from '@/types';


type GeneratedReport = {
  id: string;
  name: string;
  type: string;
  generatedDate: string;
  filters: {
    campaign: string | null;
    survey: string | null;
  };
  fileUrl?: string; // For download
};

export default function ReportsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [reportTypes, setReportTypes] = useState<{id: string, name: string}[]>([]);

  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function loadFilters() {
        setIsLoadingFilters(true);
        try {
            const [fetchedCampaigns, fetchedSurveys, fetchedReportTypes] = await Promise.all([
                getAllCampaigns(),
                getAllSurveys(), // Fetch all initially, can be filtered client-side or re-fetched
                getMockReportTypes()
            ]);
            setCampaigns([{ id: 'all', title: 'All Campaigns' } as any, ...fetchedCampaigns]);
            setSurveys([{ id: 'all', name: 'All Surveys' } as any, ...fetchedSurveys]);
            setReportTypes(fetchedReportTypes);
        } catch (error) {
            console.error("Error loading filter data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load filter options.' });
        }
        setIsLoadingFilters(false);
    }
    loadFilters();
  }, [toast]);

  const handleGenerateReport = async () => {
    if (!selectedCampaign || !selectedSurvey || !selectedReportType) {
      toast({
        variant: 'destructive',
        title: 'Missing Filters',
        description: 'Please select a campaign, survey, and report type.',
      });
      return;
    }

    setIsGenerating(true);
    toast({
      title: 'Generating Report...',
      description: 'Please wait while your report is being prepared.',
    });

    await new Promise(resolve => setTimeout(resolve, 2500));

    const campaignName = campaigns.find(c => c.id === selectedCampaign)?.title || 'N/A';
    const surveyName = surveys.find(s => s.id === selectedSurvey)?.name || 'N/A';
    const reportTypeName = reportTypes.find(rt => rt.id === selectedReportType)?.name || 'N/A';

    const newReport: GeneratedReport = {
      id: `rep_${Date.now()}`,
      name: `${campaignName} - ${surveyName} - ${reportTypeName}`,
      type: reportTypeName,
      generatedDate: new Date().toISOString(),
      filters: {
        campaign: selectedCampaign,
        survey: selectedSurvey,
      },
      fileUrl: '#mock-download-link',
    };

    setGeneratedReports(prev => [newReport, ...prev]);
    setIsGenerating(false);
    toast({
      title: 'Report Generated!',
      description: `"${newReport.name}" is ready.`,
      action: <CheckCircle className="h-5 w-5 text-green-500" />,
    });
  };

  const handleDownloadReport = (report: GeneratedReport) => {
    if (!report.fileUrl) {
        toast({ variant: 'destructive', title: 'Download Error', description: 'No file available for this report.' });
        return;
    }
    toast({ title: 'Downloading Report', description: `Starting download for "${report.name}"...` });
    const link = document.createElement('a');
    link.href = report.fileUrl;
    link.setAttribute('download', `${report.name.replace(/ /g, '_')}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSurveysForSelect = selectedCampaign && selectedCampaign !== 'all'
    ? surveys.filter(s => s.campaignId === selectedCampaign || s.id === 'all')
    : surveys;

  return (
    <div className="flex flex-col gap-6 py-6">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
          <FilePieChart className="h-6 w-6" /> Reports
        </h1>
        <Button onClick={handleGenerateReport} disabled={isGenerating || isLoadingFilters}>
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Generate Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Select criteria to generate a specific report.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div className="flex-grow min-w-[180px]">
            <label htmlFor="campaign-select" className="text-sm font-medium text-muted-foreground block mb-1">Campaign</label>
            <Select onValueChange={setSelectedCampaign} value={selectedCampaign || undefined} disabled={isLoadingFilters || campaigns.length === 0}>
              <SelectTrigger id="campaign-select" className="w-full">
                <SelectValue placeholder={isLoadingFilters ? "Loading..." : "Select Campaign"} />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-grow min-w-[180px]">
            <label htmlFor="survey-select" className="text-sm font-medium text-muted-foreground block mb-1">Survey</label>
            <Select onValueChange={setSelectedSurvey} value={selectedSurvey || undefined} disabled={isLoadingFilters || surveys.length === 0 || !selectedCampaign}>
              <SelectTrigger id="survey-select" className="w-full">
                <SelectValue placeholder={isLoadingFilters ? "Loading..." : "Select Survey"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSurveysForSelect.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-grow min-w-[180px]">
            <label htmlFor="report-type-select" className="text-sm font-medium text-muted-foreground block mb-1">Report Type</label>
            <Select onValueChange={setSelectedReportType} value={selectedReportType || undefined} disabled={isLoadingFilters || reportTypes.length === 0}>
              <SelectTrigger id="report-type-select" className="w-full">
                <SelectValue placeholder={isLoadingFilters ? "Loading..." : "Select Report Type"} />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map(rt => <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>View and download previously generated reports.</CardDescription>
        </CardHeader>
        <CardContent>
          {generatedReports.length > 0 ? (
            <ul className="space-y-3">
              {generatedReports.map((report) => (
                <li key={report.id} className="border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <p className="font-medium text-primary">{report.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Type: {report.type} | Generated: {new Date(report.generatedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadReport(report)} disabled={!report.fileUrl}>
                    <Download className="mr-2 h-3 w-3" /> Download PDF
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No reports generated yet. Use the filters above to create your first report.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

