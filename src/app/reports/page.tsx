
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePieChart, Download, ArrowLeft } from 'lucide-react'; // Import ArrowLeft
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link'; // Import Link

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
        {/* Back to Dashboard Link */}
         <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
          <FilePieChart className="h-6 w-6" /> Reports
        </h1>
        {/* Add actions like "Generate New Report" */}
        <Button>
            <Download className="mr-2 h-4 w-4" /> Generate Report
        </Button>
      </div>

       {/* Filters */}
        <Card>
            <CardHeader>
                <CardTitle>Report Filters</CardTitle>
                <CardDescription>Select criteria to generate a specific report.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
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
                 <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Report Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="summary">Summary Report</SelectItem>
                        <SelectItem value="cross_tab">Cross-Tabulation</SelectItem>
                        <SelectItem value="demographics">Demographic Breakdown</SelectItem>
                    </SelectContent>
                </Select>
                 {/* Add Date Range Picker if needed */}
            </CardContent>
        </Card>


      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>View and download previously generated reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A list or table of generated reports will appear here, allowing users to view details or download files (e.g., PDF, CSV).
            (Placeholder Content)
          </p>
          {/* Replace with a table or list of reports */}
           <div className="mt-4 border rounded-lg p-4">
                <p className="font-medium">Example Report: Spring Snack Launch Summary</p>
                <p className="text-sm text-muted-foreground">Generated: 2024-05-01 | Type: Summary</p>
                <Button variant="outline" size="sm" className="mt-2">
                    <Download className="mr-2 h-3 w-3" /> Download PDF
                </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
