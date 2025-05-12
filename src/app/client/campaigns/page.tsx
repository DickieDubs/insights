
"use client";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientCampaignsPage() {
  const { user } = useAuth();
  return (
    <ProtectedLayout>
      <PageHeader title="Your Campaigns" />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-6 w-6 text-primary" />
              My Active Campaigns
            </CardTitle>
            <CardDescription>
              View details and status of your ongoing campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Details about your campaigns, their performance, and associated surveys will be displayed here. This section is under construction.</p>
            {/* Placeholder for future content like a list of client's campaigns */}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
