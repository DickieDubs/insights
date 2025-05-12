
"use client";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ClipboardList, BarChart3, HelpCircle, ChevronRight, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";

export default function ClientDashboardPage() {
  const { user } = useAuth();

  const clientStats = [
    { title: "Your Active Campaigns", value: "3", icon: Briefcase, href: "/client/campaigns" },
    { title: "Surveys Awaiting Response", value: "1", icon: ClipboardList, href: "/client/surveys" },
    { title: "Available Reports", value: "5", icon: BarChart3, href: "/client/reports" },
  ];

  return (
    <ProtectedLayout>
      <PageHeader title={`Welcome, ${user?.name || user?.email || 'Client'}!`} />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Card className="shadow-lg rounded-xl overflow-hidden border-none">
          <div className="relative h-56 w-full group">
            <Image 
              src="https://picsum.photos/1200/400" 
              alt="Abstract Dashboard Banner"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{objectFit:"cover"}}
              priority
              data-ai-hint="abstract banner"
              className="group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-primary/10 flex flex-col items-center justify-center p-4 text-center">
              <h2 className="text-4xl font-bold text-primary-foreground drop-shadow-md">Your Insights Hub</h2>
              <p className="mt-2 text-lg text-primary-foreground/90 drop-shadow-sm">Access your campaigns, surveys, and reports.</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientStats.map((stat) => (
            <Card key={stat.title} className="shadow-sm hover:shadow-lg transition-shadow rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <Link href={stat.href} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  View Details &rarr;
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
           <Card className="shadow-sm hover:shadow-lg transition-shadow rounded-xl">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Access</CardTitle>
              <CardDescription>Jump to your most important sections.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button variant="outline" asChild className="justify-between">
                <Link href="/client/campaigns">
                  View My Campaigns <Briefcase className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-between">
                <Link href="/client/surveys">
                  Respond to Surveys <ClipboardList className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-between">
                <Link href="/client/reports">
                  Access Reports <BarChart3 className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-lg transition-shadow rounded-xl bg-gradient-to-br from-card to-accent/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-foreground">Need Help?</CardTitle>
                <HelpCircle className="h-6 w-6 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Find answers to common questions or contact our support team for assistance.
              </p>
              <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/support">
                  Visit Support Center <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}
