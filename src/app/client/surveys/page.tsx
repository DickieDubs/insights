
"use client";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientSurveysPage() {
  const { user } = useAuth();
  return (
    <ProtectedLayout>
      <PageHeader title="Your Surveys" />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-6 w-6 text-primary" />
              My Surveys
            </CardTitle>
            <CardDescription>
              Access surveys related to your campaigns and provide responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>A list of surveys awaiting your response or previously completed surveys will be shown here. This section is under construction.</p>
            {/* Placeholder for future content like a list of surveys */}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
