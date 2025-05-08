// src/app/trends/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, RefreshCw, TrendingUp as TrendingUpIcon, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import type { TrendData, TimeSeriesDataPoint, CategoricalDataPoint } from '@/types';
import { useToast } from '@/hooks/use-toast';

const productCategories = ['All', 'Snacks', 'Beverages', 'Frozen Meals', 'Health Foods'];
const timePeriods = ['Last 30 Days', 'Last 90 Days', 'Last 6 Months', 'Last Year', 'All Time'];
const regions = ['All', 'North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function TrendsPage() {
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(productCategories[0]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>(timePeriods[0]);
  const [selectedRegion, setSelectedRegion] = useState<string>(regions[0]);
  const { toast } = useToast();

  const fetchTrends = async () => {
    setIsLoading(true);
    try {
      // In a real app, pass filters to the API:
      // const response = await fetch(`/api/trends?category=${selectedCategory}&timePeriod=${selectedTimePeriod}&region=${selectedRegion}`);
      const response = await fetch('/api/trends');
      if (!response.ok) {
        throw new Error('Failed to fetch trend data');
      }
      const data: TrendData = await response.json();
      setTrendData(data);
    } catch (error) {
      console.error("Error fetching trends:", error);
      toast({
        variant: 'destructive',
        title: 'Error Fetching Trends',
        description: (error as Error).message || 'Could not load trend data.',
      });
      setTrendData(null); // Clear data on error
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTrends();
  }, []); // Fetch on initial load

  const handleRefreshData = () => {
    toast({ title: 'Refreshing Data...', description: 'Fetching latest trend insights.' });
    fetchTrends();
  };
  
  const ChartPlaceholder = () => (
    <div className="h-[300px] bg-muted rounded animate-pulse flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );


  return (
    <div className="flex flex-col gap-6 py-6">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
          <TrendingUpIcon className="h-6 w-6" /> Consumer Trends
        </h1>
        <Button onClick={handleRefreshData} disabled={isLoading} variant="outline">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh Data
        </Button>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine trend data by category, time period, or region.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isLoading}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {productCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod} disabled={isLoading}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select Time Period" />
            </SelectTrigger>
            <SelectContent>
              {timePeriods.map(period => <SelectItem key={period} value={period}>{period}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedRegion} onValueChange={setSelectedRegion} disabled={isLoading}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
            </SelectContent>
          </Select>
           <Button onClick={fetchTrends} disabled={isLoading}>Apply Filters</Button>
        </CardContent>
      </Card>

      {/* Trend Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-muted-foreground"/> Product Mentions Over Time</CardTitle>
            <CardDescription>Track mentions of key products or categories.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !trendData ? <ChartPlaceholder /> : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData.productMentions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/>
                  <Legend wrapperStyle={{fontSize: '12px'}}/>
                  <Line type="monotone" dataKey="value" name="Mentions" stroke="hsl(var(--chart-1))" strokeWidth={2} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-muted-foreground"/> Flavor Preferences</CardTitle>
            <CardDescription>Distribution of top flavor preferences.</CardDescription>
          </CardHeader>
          <CardContent>
           {isLoading || !trendData ? <ChartPlaceholder /> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={trendData.flavorPreferences} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {trendData.flavorPreferences.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/>
                  <Legend wrapperStyle={{fontSize: '12px'}}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUpIcon className="h-5 w-5 text-muted-foreground"/> Sentiment Over Time</CardTitle>
            <CardDescription>Overall consumer sentiment trend.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading || !trendData ? <ChartPlaceholder /> : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trendData.sentimentOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]}/>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/>
                        <Legend wrapperStyle={{fontSize: '12px'}}/>
                        <Bar dataKey="value" name="Sentiment Score" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
       { !isLoading && !trendData && (
        <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
                No trend data available for the selected filters.
            </CardContent>
        </Card>
      )}
    </div>
  );
}
