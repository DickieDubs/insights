
"use client";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <ProtectedLayout>
      <PageHeader title="System Settings" />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-6 w-6 text-primary" />
              Platform Settings
            </CardTitle>
            <CardDescription>
              Configure system-wide settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Options for configuring user roles, integrations, notifications, and other administrative settings will be here. This section is under construction.</p>
            {/* Placeholder for future settings forms */}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
