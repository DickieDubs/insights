
'use client'; // Required for Recharts

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link'; // Import Link
import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft


// Mock Data for Charts - Replace with dynamic data fetching and processing
const responseRateData = [
  { name: 'Survey A', sent: 400, responses: 240 },
  { name: 'Survey B', sent: 300, responses: 139 },
  { name: 'Survey C', sent: 200, responses: 198 },
  { name: 'Survey D', sent: 278, responses: 180 },
  { name: 'Survey E', sent: 189, responses: 110 },
];

const ratingData = [
  { name: '1 Star', value: 5 },
  { name: '2 Stars', value: 15 },
  { name: '3 Stars', value: 40 },
  { name: '4 Stars', value: 25 },
  { name: '5 Stars', value: 15 },
];

const completionTrendData = [
  { name: 'Jan', completions: 30, dropOffs: 5 },
  { name: 'Feb', completions: 45, dropOffs: 8 },
  { name: 'Mar', completions: 60, dropOffs: 12 },
  { name: 'Apr', completions: 55, dropOffs: 10 },
  { name: 'May', completions: 70, dropOffs: 15 },
  { name: 'Jun', completions: 85, dropOffs: 18 },
];

const COLORS = ['#DC2626', '#F97316', '#FACC15', '#84CC16', '#22C55E']; // From Red to Green

export default function InsightsPage() {
  // TODO: Add state and effects for fetching/filtering data based on selected campaign/survey

  return (
    <div className="flex flex-col gap-6 py-6">
        {/* Back to Dashboard Link */}
         <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">Insights</h1>
        {/* Filter Dropdowns */}
        <div className="flex gap-2">
           <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Campaign" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="camp_1">Spring Snack Launch</SelectItem>
                <SelectItem value="camp_3">Beverage Taste Test Q2</SelectItem>
                <SelectItem value="all">All Campaigns</SelectItem>
            </SelectContent>
           </Select>
            <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Survey" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="sur_1">Initial Concept Test</SelectItem>
                <SelectItem value="sur_4">Flavor Preference Ranking</SelectItem>
                 <SelectItem value="all">All Surveys</SelectItem>
            </SelectContent>
           </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Response Rates Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Response Rates</CardTitle>
             <CardDescription>Comparison of sent surveys vs. responses received.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={responseRateData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="sent" fill="hsl(var(--primary) / 0.5)" name="Sent" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="responses" fill="hsl(var(--accent))" name="Responses" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Ratings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Product Ratings Distribution</CardTitle>
             <CardDescription>Overall product rating distribution from surveys.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
                 <PieChart>
                    <Pie
                        data={ratingData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {ratingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                     <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                     <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                 </PieChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion Trends Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Completion Trends</CardTitle>
            <CardDescription>Monthly survey completions vs. drop-offs.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
               <LineChart data={completionTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                 <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                 <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                 <Legend wrapperStyle={{ fontSize: '12px' }}/>
                 <Line type="monotone" dataKey="completions" name="Completions" stroke="hsl(var(--accent))" strokeWidth={2} activeDot={{ r: 8 }} />
                 <Line type="monotone" dataKey="dropOffs" name="Drop-offs" stroke="hsl(var(--destructive))" strokeWidth={2} />
               </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for more charts/analytics */}
       <Card>
        <CardHeader>
          <CardTitle>More Analytics</CardTitle>
          <CardDescription>Additional insights will be displayed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Demographic breakdowns, sentiment analysis, etc.</p>
        </CardContent>
      </Card>
    </div>
  );
}
