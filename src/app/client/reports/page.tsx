
"use client";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientReportsPage() {
  const { user } = useAuth();
  return (
    <ProtectedLayout>
      <PageHeader title="Your Reports" />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-6 w-6 text-primary" />
              My Reports
            </CardTitle>
            <CardDescription>
              View and download reports generated for your campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>A list of available reports with download links or embedded views will be displayed here. This section is under construction.</p>
            {/* Placeholder for future content like a list of reports */}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
