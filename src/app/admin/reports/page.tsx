'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  Server,
  Brain,
  HelpCircle,
  LineChart,
  PieChartIcon as ShadcnPieChartIcon,
  Briefcase,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  getSurveys as apiGetSurveys,
  getCampaigns as apiGetCampaigns,
  getAllBrands as apiGetAllBrands,
  getDemographicReport, // Changed from getDemographicInsights
  getBrandInsightsReport,
  getSurveyAnalysisReport,
  getQuestionInsights,
  getFullSystemReport,
  getSystemClientsReport,
  getSystemCustomersReport,
  getSystemCampaignsReport,
  getSystemSurveysReport,
  getSystemSubmissionsReport,
} from '@/services/cia-api'
import type {
  Survey,
  Campaign,
  Brand,
  Report,
  DemographicInsightsData,
  QuestionInsightsData,
  SurveyAnalysisReportData,
  BrandInsightsData,
  FullSystemReportData,
  SystemClientsReportData,
  SystemCustomersReportData,
  SystemCampaignsReportData,
  SystemSurveysReportData,
  SystemSubmissionsReportData,
} from '@/services/cia-api'
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// Define a more specific type for the report data prop
type ReportDataProp = Report<any> | null | undefined

const CHART_COLORS_PRIMARY_SET = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]
const CHART_COLORS_EXTENDED_SET = [
  // For more categories
  ...CHART_COLORS_PRIMARY_SET,
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--accent) / 0.8)',
  'hsl(var(--muted-foreground) / 0.5)',
  'hsl(var(--primary) / 0.6)',
  'hsl(var(--accent) / 0.6)',
]

const systemClientsChartConfig = {
  active: { label: 'Active', color: CHART_COLORS_PRIMARY_SET[0] },
  pending: { label: 'Pending', color: CHART_COLORS_PRIMARY_SET[1] },
  inactive: { label: 'Inactive', color: CHART_COLORS_PRIMARY_SET[2] },
  admin: { label: 'Admin', color: CHART_COLORS_PRIMARY_SET[3] },
  client: { label: 'Client', color: CHART_COLORS_PRIMARY_SET[4] },
  other: { label: 'Other', color: 'hsl(var(--muted))' },
} satisfies ChartConfig

const demographicChartConfig = {
  // Common keys, add more as needed or handle dynamically
  male: { label: 'Male', color: CHART_COLORS_PRIMARY_SET[0] },
  female: { label: 'Female', color: CHART_COLORS_PRIMARY_SET[1] },
  'non-binary': { label: 'Non-binary', color: CHART_COLORS_PRIMARY_SET[2] },
  'prefer-not-to-say': {
    label: 'Prefer not to say',
    color: CHART_COLORS_PRIMARY_SET[3],
  },
  '18-24': { label: '18-24', color: CHART_COLORS_EXTENDED_SET[0] },
  '25-34': { label: '25-34', color: CHART_COLORS_EXTENDED_SET[1] },
  '35-44': { label: '35-44', color: CHART_COLORS_EXTENDED_SET[2] },
  '45-54': { label: '45-54', color: CHART_COLORS_EXTENDED_SET[3] },
  '55+': { label: '55+', color: CHART_COLORS_EXTENDED_SET[4] },
  // Add more for income, geo etc. as common patterns emerge
  defaultCategory: { label: 'Category', color: 'hsl(var(--muted))' },
} satisfies ChartConfig

// Helper to generate title from camelCase or snake_case key
const formatKeyAsTitle = (key: string) => {
  const result = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

function ReportDisplayCard({
  title,
  icon: Icon,
  data,
  isLoading,
  error,
  noDataMessage = 'No data available for this report.',
  reportKey,
}: {
  title: string
  icon: React.ElementType
  data: ReportDataProp
  isLoading: boolean
  error: Error | null
  noDataMessage?: string
  reportKey?: string
}) {
  const reportPayload = data?.data
  const hasMeaningfulData = React.useMemo(() => {
    if (!reportPayload) return false
    if (Array.isArray(reportPayload)) return reportPayload.length > 0
    if (typeof reportPayload === 'object' && reportPayload !== null)
      return Object.keys(reportPayload).length > 0
    if (typeof reportPayload === 'string') return reportPayload.trim() !== ''
    return reportPayload !== undefined && reportPayload !== null
  }, [reportPayload])

  const renderChart = () => {
    if (!reportPayload) return null

    if (reportKey === 'systemClients') {
      const clientsReport = reportPayload as SystemClientsReportData
      const statusData = Object.entries(
        clientsReport.statusBreakdown || {}
      ).map(([name, value], index) => ({
        name,
        value,
        fill: (
          systemClientsChartConfig[
            name as keyof typeof systemClientsChartConfig
          ] || {
            color:
              CHART_COLORS_EXTENDED_SET[
                index % CHART_COLORS_EXTENDED_SET.length
              ],
          }
        ).color,
      }))
      const roleData = Object.entries(clientsReport.roleDistribution || {}).map(
        ([name, value], index) => ({
          name,
          value,
          fill: (
            systemClientsChartConfig[
              name as keyof typeof systemClientsChartConfig
            ] || {
              color:
                CHART_COLORS_EXTENDED_SET[
                  index % CHART_COLORS_EXTENDED_SET.length
                ],
            }
          ).color,
        })
      )

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {statusData.length > 0 && (
            <div className="p-4 border border-dashed rounded-md bg-card">
              <h4 className="text-md font-semibold mb-3 text-center text-card-foreground">
                Client Status Breakdown
              </h4>
              <ChartContainer
                config={systemClientsChartConfig}
                className="min-h-[200px] w-full aspect-square"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}-${index}`}
                          fill={entry.fill}
                        />
                      ))}
                    </Pie>
                    <Legend content={<ChartLegendContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}
          {roleData.length > 0 && (
            <div className="p-4 border border-dashed rounded-md bg-card">
              <h4 className="text-md font-semibold mb-3 text-center text-card-foreground">
                Client Role Distribution
              </h4>
              <ChartContainer
                config={systemClientsChartConfig}
                className="min-h-[200px] w-full aspect-square"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={roleData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {roleData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}-${index}`}
                          fill={entry.fill}
                        />
                      ))}
                    </Pie>
                    <Legend content={<ChartLegendContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}
        </div>
      )
    } else if (reportKey === 'demographicInsights') {
      const demographicData = reportPayload as DemographicInsightsData
      console.log('Demographic Data Received for Charting:', demographicData) // Log for debugging

      if (typeof demographicData !== 'object' || demographicData === null) {
        return (
          <p className="text-muted-foreground">
            Demographic data is not in the expected object format.
          </p>
        )
      }

      const chartableEntries = Object.entries(demographicData).filter(
        ([key, value]) =>
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value) &&
          Object.keys(value).length > 0 && // Ensure the distribution object is not empty
          Object.values(value).every((v) => typeof v === 'number')
      )

      if (chartableEntries.length === 0) {
        return (
          <div>
            <p className="text-muted-foreground">
              No chartable demographic distributions found in the received data.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Expected format for chartable distributions (e.g., 'age',
              'gender'): <code>{`{ "category1": 10, "category2": 20 }`}</code>
            </p>
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-primary">
                View Raw Demographic Data
              </summary>
              <pre className="mt-1 w-full whitespace-pre-wrap break-all rounded-md bg-muted/50 p-2 text-sm max-h-60 overflow-auto border">
                {JSON.stringify(demographicData, null, 2)}
              </pre>
            </details>
          </div>
        )
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {chartableEntries.map(([key, distributionObj], chartIndex) => {
            const chartData = Object.entries(distributionObj).map(
              ([name, value], index) => ({
                name,
                value,
                fill: (
                  demographicChartConfig[
                    name as keyof typeof demographicChartConfig
                  ] || {
                    color:
                      CHART_COLORS_EXTENDED_SET[
                        index % CHART_COLORS_EXTENDED_SET.length
                      ],
                  }
                ).color,
              })
            )

            if (chartData.length === 0) return null // Should not happen due to filter above, but good practice

            return (
              <div
                key={`${key}-${chartIndex}`}
                className="p-4 border border-dashed rounded-md bg-card"
              >
                <h4 className="text-md font-semibold mb-3 text-center text-card-foreground">
                  {formatKeyAsTitle(key)} Distribution
                </h4>
                <ChartContainer
                  config={demographicChartConfig}
                  className="min-h-[200px] w-full aspect-square"
                >
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Tooltip
                        content={
                          <ChartTooltipContent nameKey="name" hideLabel />
                        }
                      />
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name}-${index}`}
                            fill={entry.fill}
                          />
                        ))}
                      </Pie>
                      <Legend content={<ChartLegendContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )
          })}
        </div>
      )
    }

    // Fallback for unhandled or non-chartable reports
    if (hasMeaningfulData) {
      return (
        <pre className="mt-2 w-full whitespace-pre-wrap break-all rounded-md bg-muted p-4 text-sm max-h-96 overflow-auto">
          {JSON.stringify(reportPayload, null, 2)}
        </pre>
      )
    }
    return null // No chart and no JSON data to show
  }

  return (
    <Card className="shadow-sm rounded-xl bg-card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-card-foreground">
          <Icon className="mr-2 h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <LoadingSpinner message="Loading report data..." />}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error loading report</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && !hasMeaningfulData && (
          <p className="text-muted-foreground">{noDataMessage}</p>
        )}
        {!isLoading && !error && renderChart()}
      </CardContent>
    </Card>
  )
}

export default function AdminReportsPage() {
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null
  )
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)

  const {
    data: surveys = [],
    isLoading: isLoadingSurveys,
    error: surveysError,
  } = useQuery<Survey[], Error>({
    queryKey: ['surveysForAllReports'],
    queryFn: apiGetSurveys,
  })

  const {
    data: campaigns = [],
    isLoading: isLoadingCampaigns,
    error: campaignsError,
  } = useQuery<Campaign[], Error>({
    queryKey: ['campaignsForAllReports'],
    queryFn: apiGetCampaigns,
  })

  const {
    data: brands = [],
    isLoading: isLoadingBrands,
    error: brandsError,
  } = useQuery<Brand[], Error>({
    queryKey: ['brandsForAllReports'],
    queryFn: apiGetAllBrands,
  })

  // Full System Report
  const {
    data: fullSystemReport,
    isLoading: isLoadingFullSystemReport,
    error: fullSystemReportError,
  } = useQuery<Report<FullSystemReportData> | null, Error>({
    queryKey: ['fullSystemReport'],
    queryFn: getFullSystemReport,
  })

  // Demographic Insights (can be by surveyId or campaignId)
  const {
    data: demographicInsights,
    isLoading: isLoadingDemographicInsights,
    error: demographicInsightsError,
  } = useQuery<Report<DemographicInsightsData> | null, Error>({
    queryKey: ['demographicInsights', selectedSurveyId, selectedCampaignId],
    queryFn: () =>
      getDemographicReport({
        surveyId: selectedSurveyId || undefined,
        campaignId: selectedCampaignId || undefined,
      }), // Changed here
    enabled: !!selectedSurveyId || !!selectedCampaignId,
  })

  // Question Insights (can be by surveyId or campaignId)
  const {
    data: questionInsights,
    isLoading: isLoadingQuestionInsights,
    error: questionInsightsError,
  } = useQuery<Report<QuestionInsightsData> | null, Error>({
    queryKey: ['questionInsights', selectedSurveyId, selectedCampaignId],
    queryFn: () =>
      getQuestionInsights({
        surveyId: selectedSurveyId || undefined,
        campaignId: selectedCampaignId || undefined,
      }),
    enabled: !!selectedSurveyId || !!selectedCampaignId,
  })

  // Survey Analysis Report (by surveyId)
  const {
    data: surveyAnalysisReport,
    isLoading: isLoadingSurveyAnalysisReport,
    error: surveyAnalysisReportError,
  } = useQuery<Report<SurveyAnalysisReportData> | null, Error>({
    queryKey: ['surveyAnalysisReport', selectedSurveyId],
    queryFn: () => getSurveyAnalysisReport(selectedSurveyId!),
    enabled: !!selectedSurveyId,
  })

  // Brand Insights Report (by brandId)
  const {
    data: brandInsightsReport,
    isLoading: isLoadingBrandInsightsReport,
    error: brandInsightsReportError,
  } = useQuery<Report<BrandInsightsData> | null, Error>({
    queryKey: ['brandInsightsReport', selectedBrandId],
    queryFn: () => getBrandInsightsReport(selectedBrandId!),
    enabled: !!selectedBrandId,
  })

  // Specific System Reports
  const {
    data: systemClientsReport,
    isLoading: isLoadingSystemClients,
    error: systemClientsError,
  } = useQuery<Report<SystemClientsReportData> | null, Error>({
    queryKey: ['systemClientsReport'],
    queryFn: getSystemClientsReport,
  })
  const {
    data: systemCustomersReport,
    isLoading: isLoadingSystemCustomers,
    error: systemCustomersError,
  } = useQuery<Report<SystemCustomersReportData> | null, Error>({
    queryKey: ['systemCustomersReport'],
    queryFn: getSystemCustomersReport,
  })
  const {
    data: systemCampaignsReport,
    isLoading: isLoadingSystemCampaigns,
    error: systemCampaignsError,
  } = useQuery<Report<SystemCampaignsReportData> | null, Error>({
    queryKey: ['systemCampaignsReport'],
    queryFn: getSystemCampaignsReport,
  })
  const {
    data: systemSurveysReport,
    isLoading: isLoadingSystemSurveys,
    error: systemSurveysError,
  } = useQuery<Report<SystemSurveysReportData> | null, Error>({
    queryKey: ['systemSurveysReport'],
    queryFn: getSystemSurveysReport,
  })
  const {
    data: systemSubmissionsReport,
    isLoading: isLoadingSystemSubmissions,
    error: systemSubmissionsError,
  } = useQuery<Report<SystemSubmissionsReportData> | null, Error>({
    queryKey: ['systemSubmissionsReport'],
    queryFn: getSystemSubmissionsReport,
  })

  return (
    <ProtectedLayout>
      <PageHeader title="View Reports" />
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <Card className="shadow-sm rounded-xl bg-card">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-card-foreground">
              <BarChart3 className="mr-3 h-7 w-7 text-primary" />
              Reporting Dashboard
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Access system-wide reports or select a survey, campaign, or brand
              for specific insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="survey-select" className="text-foreground">
                  Select Survey
                </Label>
                <Select
                  value={selectedSurveyId || ''}
                  onValueChange={(value) => {
                    setSelectedSurveyId(value === 'none' ? null : value)
                    if (value !== 'none') {
                      setSelectedCampaignId(null)
                      setSelectedBrandId(null)
                    }
                  }}
                  disabled={isLoadingSurveys}
                >
                  <SelectTrigger id="survey-select" className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingSurveys
                          ? 'Loading surveys...'
                          : 'For Survey/Question Insights'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {surveysError && (
                      <SelectItem value="error" disabled>
                        Error loading surveys
                      </SelectItem>
                    )}
                    {!isLoadingSurveys &&
                      surveys.map((survey) => (
                        <SelectItem key={survey.id} value={survey.id}>
                          {survey.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {surveysError && (
                  <p className="text-sm text-destructive">
                    {surveysError.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-select" className="text-foreground">
                  Select Campaign
                </Label>
                <Select
                  value={selectedCampaignId || ''}
                  onValueChange={(value) => {
                    setSelectedCampaignId(value === 'none' ? null : value)
                    if (value !== 'none') {
                      setSelectedSurveyId(null)
                      // Potentially clear brandId if campaign context is primary for demographic/question reports
                      // setSelectedBrandId(null);
                    }
                  }}
                  disabled={isLoadingCampaigns}
                >
                  <SelectTrigger id="campaign-select" className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingCampaigns
                          ? 'Loading campaigns...'
                          : 'For Demographic/Question Insights'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {campaignsError && (
                      <SelectItem value="error" disabled>
                        Error loading campaigns
                      </SelectItem>
                    )}
                    {!isLoadingCampaigns &&
                      campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {campaignsError && (
                  <p className="text-sm text-destructive">
                    {campaignsError.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-select" className="text-foreground">
                  Select Brand
                </Label>
                <Select
                  value={selectedBrandId || ''}
                  onValueChange={(value) => {
                    setSelectedBrandId(value === 'none' ? null : value)
                    if (value !== 'none') {
                      setSelectedSurveyId(null)
                      // Potentially clear campaignId if brand context is primary for brand insights
                      // setSelectedCampaignId(null);
                    }
                  }}
                  disabled={isLoadingBrands}
                >
                  <SelectTrigger id="brand-select" className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingBrands
                          ? 'Loading brands...'
                          : 'For Brand Insights'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {brandsError && (
                      <SelectItem value="error" disabled>
                        Error loading brands
                      </SelectItem>
                    )}
                    {!isLoadingBrands &&
                      brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {brandsError && (
                  <p className="text-sm text-destructive">
                    {brandsError.message}
                  </p>
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold pt-4 border-t mt-4 text-foreground">
              System-Wide Reports
            </h3>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              <ReportDisplayCard
                title="Full System Report"
                icon={Server}
                data={fullSystemReport}
                isLoading={isLoadingFullSystemReport}
                error={fullSystemReportError}
                reportKey="fullSystem"
              />
              <ReportDisplayCard
                title="System: Clients Report"
                icon={Users}
                data={systemClientsReport}
                isLoading={isLoadingSystemClients}
                error={systemClientsError}
                reportKey="systemClients"
              />
              <ReportDisplayCard
                title="System: Customers Report"
                icon={Users}
                data={systemCustomersReport}
                isLoading={isLoadingSystemCustomers}
                error={systemCustomersError}
                reportKey="systemCustomers"
              />
              <ReportDisplayCard
                title="System: Campaigns Report"
                icon={Briefcase}
                data={systemCampaignsReport}
                isLoading={isLoadingSystemCampaigns}
                error={systemCampaignsError}
                reportKey="systemCampaigns"
              />
              <ReportDisplayCard
                title="System: Surveys Report"
                icon={FileText}
                data={systemSurveysReport}
                isLoading={isLoadingSystemSurveys}
                error={systemSurveysError}
                reportKey="systemSurveys"
              />
              <ReportDisplayCard
                title="System: Submissions Report"
                icon={LineChart}
                data={systemSubmissionsReport}
                isLoading={isLoadingSystemSubmissions}
                error={systemSubmissionsError}
                reportKey="systemSubmissions"
              />
            </div>

            {(selectedSurveyId || selectedCampaignId || selectedBrandId) && (
              <h3 className="text-lg font-semibold pt-4 border-t mt-6 text-foreground">
                Contextual Reports
              </h3>
            )}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {(selectedSurveyId || selectedCampaignId) && (
                <>
                  <ReportDisplayCard
                    title="Demographic Insights"
                    icon={ShadcnPieChartIcon}
                    data={demographicInsights}
                    isLoading={isLoadingDemographicInsights}
                    error={demographicInsightsError}
                    noDataMessage="Select a survey or campaign to view demographic insights."
                    reportKey="demographicInsights"
                  />
                  <ReportDisplayCard
                    title="Question Insights"
                    icon={HelpCircle}
                    data={questionInsights}
                    isLoading={isLoadingQuestionInsights}
                    error={questionInsightsError}
                    noDataMessage="Select a survey or campaign to view question insights."
                    reportKey="questionInsights"
                  />
                </>
              )}
              {selectedSurveyId && (
                <ReportDisplayCard
                  title="Survey Analysis Report (AI)"
                  icon={Brain}
                  data={surveyAnalysisReport}
                  isLoading={isLoadingSurveyAnalysisReport}
                  error={surveyAnalysisReportError}
                  noDataMessage="Select a survey to view AI analysis."
                  reportKey="surveyAnalysis"
                />
              )}
              {selectedBrandId && (
                <ReportDisplayCard
                  title="Brand Insights Report"
                  icon={TrendingUp}
                  data={brandInsightsReport}
                  isLoading={isLoadingBrandInsightsReport}
                  error={brandInsightsReportError}
                  noDataMessage="Select a brand to view its insights."
                  reportKey="brandInsights"
                />
              )}
            </div>
            {!selectedSurveyId && !selectedCampaignId && !selectedBrandId && (
              <Alert className="mt-6 bg-background">
                <AlertTitle className="text-foreground">
                  Select a Context
                </AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  Please select a survey, campaign, or brand from the dropdowns
                  above to view specific reports. System-wide reports are always
                  available.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
