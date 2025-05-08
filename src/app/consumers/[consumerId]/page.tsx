// src/app/consumers/[consumerId]/page.tsx
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Mail, User, Tag, FileText, Edit, UsersRound, CalendarDays, StickyNote, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { use } from 'react';
import type { Consumer } from '@/types';
import { getConsumerById } from '@/lib/firebase/firestore-service';
import { notFound } from 'next/navigation';

async function getConsumerData(consumerId: string): Promise<Consumer | null> {
  return getConsumerById(consumerId);
}

export default function ConsumerDetailPage({ params }: { params: Promise<{ consumerId: string }> }) {
  const { consumerId } = use(params);
  const consumer = use(getConsumerData(consumerId));

  if (!consumer) {
    // Standard Next.js way to handle not found in Server Components
    notFound(); 
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex justify-between items-center mb-4">
        <Link href="/consumers" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary w-fit">
          <ArrowLeft className="h-4 w-4" />
          Back to Consumers List
        </Link>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/consumers/${consumer.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="w-full md:w-1/3">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
              <AvatarImage src={consumer.avatarUrl || `https://picsum.photos/seed/${consumer.id}/128`} alt={consumer.name} data-ai-hint="person avatar" />
              <AvatarFallback>{consumer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle>{consumer.name}</CardTitle>
            {consumer.segment && (
              <CardDescription className="flex items-center gap-1"><Tag className="h-3 w-3 text-muted-foreground" /> {consumer.segment}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <Separator />
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email</p>
                <a href={`mailto:${consumer.email}`} className="text-primary hover:underline">{consumer.email}</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Joined</p>
                <p className="text-muted-foreground">{formatDate(consumer.createdAt)}</p>
              </div>
            </div>
             <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Last Active</p>
                <p className="text-muted-foreground">{formatDate(consumer.lastActive)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UsersRound className="h-5 w-5 text-primary" />Consumer Activity & Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1 flex items-center gap-1"><FileText className="h-4 w-4 text-muted-foreground"/> Surveys Taken: {consumer.surveysTaken || 0}</h3>
                {/* Placeholder for list of surveys - this would require fetching related survey data */}
                <p className="text-sm text-muted-foreground italic pl-5">
                  (Detailed survey history coming soon)
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium mb-1 flex items-center gap-1"><StickyNote className="h-4 w-4 text-muted-foreground"/> Notes</h3>
                <p className="text-sm text-muted-foreground italic">
                  {consumer.notes || 'No notes for this consumer.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
