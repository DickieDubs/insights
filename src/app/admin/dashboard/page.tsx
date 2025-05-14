'use client'

import React from 'react' // Added React import
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
  Briefcase,
  Users,
  FileText,
  BarChart3,
  Activity,
  Link as LinkIcon,
  ChevronRight,
  Settings,
  ArrowRight,
  PlusCircle,
  ListChecks, // Added for Total Responses
  Star, // Added for Average Rating
  ThumbsUp, // Added for Recommendation Score
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useQuery, useQueries } from '@tanstack/react-query'
import {
  getClients,
  getCampaigns,
  getSurveys,
  getSystemReport,
  getBrandInsightsReport,
  getSurveyAnalysisReport,
  Survey,
  getActivityLogs,
  type ActivityLog,
  getBrands,
} from '@/services/cia-api'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert' // Import Alert
import { useAuth } from '@/contexts/AuthContext' // Add this import
import { useToast } from '@/hooks/use-toast' // Fix the import path for useToast
import { formatDistanceToNow } from 'date-fns'

interface SystemReportSummary {
  totalResponses?: number
  averageRating?: number
  recommendationScore?: number
  totalClients?: number
  activeCampaigns?: number
  surveysConducted?: number
}

interface Campaign {
  id: string
  clientId: string
  brandIds: string[]
  title: string
  description: string
  status: string
  createdAt: { _seconds: number; _nanoseconds: number }
  endDate: string | { _seconds: number; _nanoseconds: number }
  startDate: string | { _seconds: number; _nanoseconds: number }
  updatedAt: { _seconds: number; _nanoseconds: number }
  rewards?:
    | Array<{
        id: string
        type: string
        description: string
        currency: string
        value: number
        autoDistribute: boolean
        criteria: { minSurveyCompletions: number }
      }>
    | string
}

const activityIcons = {
  client: Users,
  campaign: Briefcase,
  survey: FileText,
  report: BarChart3,
} as const

export default function AdminDashboardPage() {
  const { token } = useAuth()
  const { toast } = useToast()

  // Fetch campaigns with proper error handling
  const {
    data: campaigns,
    isLoading: isLoadingCampaigns,
    isError: isCampaignsError,
    error: campaignsError,
  } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      try {
        const campaigns = await getCampaigns()
        return campaigns
      } catch (error) {
        console.error('Error fetching campaigns:', error)
        throw error
      }
    },
    enabled: !!token,
  })

  // Fetch surveys with proper error handling
  const {
    data: surveys,
    isLoading: isLoadingSurveys,
    isError: isSurveysError,
    error: surveysError,
  } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      try {
        const surveys = await getSurveys()
        return surveys
      } catch (error) {
        console.error('Error fetching surveys:', error)
        throw error
      }
    },
    enabled: !!token,
  })

  // Fetch brands with proper error handling
  const {
    data: brands,
    isLoading: isLoadingBrands,
    isError: isBrandsError,
    error: brandsError,
  } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      try {
        const brands = await getBrands()
        return brands
      } catch (error) {
        console.error('Error fetching brands:', error)
        throw error
      }
    },
    enabled: !!token,
  })

  // Compute metrics from the fetched data
  const metrics = {
    activeCampaigns:
      campaigns?.filter((c) => c.status === 'active').length ?? 0,
    totalCampaigns: campaigns?.length ?? 0,
    activeSurveys: surveys?.filter((s) => s.status === 'active').length ?? 0,
    totalSurveys: surveys?.length ?? 0,
    totalQuestions:
      surveys?.reduce((sum, s) => sum + (s.questions?.length ?? 0), 0) ?? 0,
    uniqueBrands: brands?.length ?? 0,
  }

  const stats = [
    {
      title: 'Active Campaigns',
      value: isLoadingCampaigns ? (
        <LoadingSpinner iconClassName="h-4 w-4" />
      ) : isCampaignsError ? (
        <div className="flex flex-col items-center gap-2">
          <Alert variant="destructive" className="p-2 text-xs">
            <AlertDescription>
              {campaignsError?.message || 'Failed to load campaigns'}
            </AlertDescription>
          </Alert>
          <Button variant="outline" size="sm" className="h-8" asChild>
            <Link href="/admin/campaigns">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
        </div>
      ) : metrics.totalCampaigns === 0 ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">No campaigns found</p>
          <Button variant="outline" size="sm" className="h-8" asChild>
            <Link href="/admin/campaigns">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
        </div>
      ) : (
        metrics.activeCampaigns.toLocaleString()
      ),
      icon: Briefcase,
      href: '/admin/campaigns',
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10',
    },
    {
      title: 'Active Surveys',
      value: isLoadingSurveys ? (
        <LoadingSpinner iconClassName="h-4 w-4" />
      ) : isSurveysError ? (
        <div className="flex flex-col items-center gap-2">
          <Alert variant="destructive" className="p-2 text-xs">
            <AlertDescription>
              {surveysError?.message || 'Failed to load surveys'}
            </AlertDescription>
          </Alert>
          <Button variant="outline" size="sm" className="h-8" asChild>
            <Link href="/admin/surveys">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Survey
            </Link>
          </Button>
        </div>
      ) : metrics.totalSurveys === 0 ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">No surveys found</p>
          <Button variant="outline" size="sm" className="h-8" asChild>
            <Link href="/admin/surveys">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Survey
            </Link>
          </Button>
        </div>
      ) : (
        metrics.activeSurveys.toLocaleString()
      ),
      icon: FileText,
      href: '/admin/surveys',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Total Questions',
      value: isLoadingSurveys ? (
        <LoadingSpinner iconClassName="h-4 w-4" />
      ) : isSurveysError ? (
        <Alert variant="destructive" className="p-2 text-xs">
          <AlertDescription>
            {surveysError?.message || 'Failed to load questions'}
          </AlertDescription>
        </Alert>
      ) : metrics.totalSurveys === 0 ? (
        <span className="text-sm text-muted-foreground">0</span>
      ) : (
        metrics.totalQuestions.toLocaleString()
      ),
      icon: ListChecks,
      href: '/admin/surveys',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Unique Brands',
      value: isLoadingBrands ? (
        <LoadingSpinner iconClassName="h-4 w-4" />
      ) : isBrandsError ? (
        <div className="flex flex-col items-center gap-2">
          <Alert variant="destructive" className="p-2 text-xs">
            <AlertDescription>
              {brandsError?.message || 'Failed to load brands'}
            </AlertDescription>
          </Alert>
          <Button variant="outline" size="sm" className="h-8" asChild>
            <Link href="/admin/brands">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Brand
            </Link>
          </Button>
        </div>
      ) : metrics.uniqueBrands === 0 ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">No brands found</p>
          <Button variant="outline" size="sm" className="h-8" asChild>
            <Link href="/admin/brands">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Brand
            </Link>
          </Button>
        </div>
      ) : (
        metrics.uniqueBrands.toLocaleString()
      ),
      icon: Briefcase,
      href: '/admin/brands',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ]

  // Add activity logs query
  const {
    data: activities,
    isLoading: isLoadingActivities,
    error: activitiesError,
  } = useQuery<ActivityLog[]>({
    queryKey: ['activityLogs', 'recent'],
    queryFn: () => getActivityLogs({ page: 1 }),
    enabled: !!token,
  })

  // Replace the placeholder recentActivities with real data
  const recentActivities = activities?.slice(0, 5) || []

  const quickLinks = [
    {
      title: 'Manage Clients',
      href: '/admin/clients',
      icon: Users,
      variant: 'ghost' as const,
    },
    {
      title: 'Manage Campaigns',
      href: '/admin/campaigns',
      icon: Briefcase,
      variant: 'ghost' as const,
    },
    {
      title: 'Manage Surveys',
      href: '/admin/surveys',
      icon: FileText,
      variant: 'ghost' as const,
    },
    {
      title: 'System Settings',
      href: '/admin/settings',
      icon: Settings,
      variant: 'ghost' as const,
    },
  ]

  return (
    <ProtectedLayout>
      <TooltipProvider>
        <PageHeader title="Admin Dashboard" />
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card
                key={stat.title}
                className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-xl border-l-4 border-primary overflow-hidden bg-card"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={cn('p-2 rounded-full', stat.bgColor)}>
                    <stat.icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground mb-1 flex items-center">
                    {/* Conditional rendering for value */}
                    {typeof stat.value === 'number' ||
                    typeof stat.value === 'string'
                      ? stat.value
                      : React.isValidElement(stat.value)
                      ? stat.value // Render loading spinner or error alert
                      : 'N/A'}
                  </div>
                  <Link href={stat.href} passHref legacyBehavior>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-xs text-primary hover:underline"
                    >
                      View Details <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Recent Activity Card */}
            <Card className="md:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-xl bg-card">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex-1 grid gap-1 min-w-0">
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                    <Activity className="mr-3 h-6 w-6 text-primary flex-shrink-0" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Overview of latest platform activities.
                  </CardDescription>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="ml-auto flex-shrink-0"
                >
                  <Link href="/admin/logs">
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-1 max-h-80 overflow-y-auto pr-2">
                {isLoadingActivities ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : activitiesError ? (
                  <Alert variant="destructive" className="p-2">
                    <AlertDescription className="text-xs">
                      Failed to load recent activities.
                    </AlertDescription>
                  </Alert>
                ) : recentActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity to display.
                  </p>
                ) : (
                  recentActivities.map((activity) => {
                    const Icon = activityIcons[activity.type]
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1 p-2.5 bg-primary/10 rounded-full">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-sm font-medium leading-tight text-foreground truncate cursor-default">
                                {activity.title}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent
                              className="max-w-xs z-50"
                              side="top"
                            >
                              <p>{activity.title}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-muted-foreground truncate cursor-default">
                                {activity.subtitle}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent
                              className="max-w-xs z-50"
                              side="top"
                            >
                              <p>{activity.subtitle}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="ml-auto text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 pt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Quick Links Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-xl bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                  <LinkIcon className="mr-3 h-6 w-6 text-primary flex-shrink-0" />
                  Quick Links
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Navigate to key sections quickly.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2">
                {quickLinks.map((link) => (
                  <Button
                    key={link.title}
                    variant={link.variant}
                    asChild
                    className="w-full justify-start text-left px-3 py-2 h-auto hover:bg-accent hover:text-accent-foreground" // Ensure hover styles apply
                  >
                    <Link href={link.href}>
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.title}
                    </Link>
                  </Button>
                ))}
                {/* Explicit Add New Client Button */}
                <Button
                  variant="default" // Primary action style
                  asChild
                  className="w-full justify-start text-left mt-2 px-3 py-2 h-auto"
                >
                  <Link
                    href="/admin/clients"
                    onClick={(e) => {
                      // Ideally trigger dialog from clients page. For now, navigates.
                      console.log('Navigate to Clients page to add new client')
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Client
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </ProtectedLayout>
  )
}
