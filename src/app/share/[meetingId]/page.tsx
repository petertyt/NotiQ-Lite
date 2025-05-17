
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPublicMeetingById } from '@/services/meeting-service';
import type { Meeting } from '@/types/meeting';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileText, AlertTriangle, Lock, ClipboardList, Tags, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/app-header'; // Re-use AppHeader for consistent branding
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NotiqLogo } from '@/components/icons/notiq-logo';

// Minimal fetch and display of action items and key topics if needed for public page
// These would typically be re-extracted if not stored directly with the meeting.
// For simplicity, let's assume they are not deeply integrated here yet.
// import { extractActionItems, type ActionItem } from '@/ai/flows/extract-action-items-flow';
// import { extractKeyTopics } from '@/ai/flows/extract-key-topics-flow';


export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [actionItems, setActionItems] = useState<ActionItem[] | null>(null);
  // const [keyTopics, setKeyTopics] = useState<string[] | null>(null);


  useEffect(() => {
    if (meetingId) {
      const fetchMeetingData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedMeeting = await getPublicMeetingById(meetingId);
          if (fetchedMeeting) {
            setMeeting(fetchedMeeting);
            // If transcript exists, we could re-extract action items/topics here
            // For now, keeping it simple and relying on what's stored in Meeting type
            // if (fetchedMeeting.transcript) {
            //   const [actions, topics] = await Promise.all([
            //     extractActionItems({ transcript: fetchedMeeting.transcript }),
            //     extractKeyTopics({ transcript: fetchedMeeting.transcript })
            //   ]);
            //   setActionItems(actions.actionItems);
            //   setKeyTopics(topics.topics);
            // }
          } else {
            setError("This meeting is not available for sharing or does not exist.");
          }
        } catch (e: any) {
          console.error("Error fetching shared meeting:", e);
          setError(e.message || "Failed to load meeting details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchMeetingData();
    } else {
      setError("No meeting ID provided.");
      setIsLoading(false);
    }
  }, [meetingId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading meeting notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive mb-2">Access Denied or Not Found</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link href="/" passHref>
          <Button variant="outline">Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  if (!meeting) {
    // This case should ideally be covered by error state, but as a fallback:
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Meeting Not Found</h1>
        <p className="text-muted-foreground mb-6">The requested meeting could not be found or is not shared.</p>
         <Link href="/" passHref>
          <Button variant="outline">Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  // For simplicity, Action Items and Key Topics are not re-extracted on share page in this iteration.
  // They would be shown if they were part of the 'Meeting' object saved in DB.

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-card text-card-foreground p-3 shadow-md sticky top-0 z-50 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer" aria-label="Go to NotiQ Lite homepage">
            <NotiqLogo className="h-7 w-auto text-primary" />
            <h1 className="text-xl font-semibold tracking-tight text-primary hidden sm:block">NotiQ Lite</h1>
          </Link>
          <span className="text-sm text-muted-foreground">Shared Meeting</span>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-primary">{meeting.title}</CardTitle>
            {meeting.audioFileName && (
              <CardDescription>Original audio: {meeting.audioFileName}</CardDescription>
            )}
             <CardDescription>Shared on: {meeting.updatedAt ? new Date(meeting.updatedAt.seconds * 1000).toLocaleString() : 'N/A'}</CardDescription>
          </CardHeader>
        </Card>

        {meeting.summary && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-6 w-6 text-primary" />
                Meeting Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-auto max-h-96 rounded-md border p-4 bg-muted/30">
                <p className="text-sm whitespace-pre-wrap">{meeting.summary}</p>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Future: Display Action Items and Key Topics if stored/re-extracted */}
        {/* For now, we'll skip re-extracting them on the public page for simplicity */}
        {/* 
        {actionItems && actionItems.length > 0 && (
          <Card className="shadow-md">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><ListChecks className="h-6 w-6 text-primary" />Action Items</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {actionItems.map((item, index) => (
                  <li key={index} className="text-sm p-2 border rounded-md bg-muted/30">{item.description}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {keyTopics && keyTopics.length > 0 && (
          <Card className="shadow-md">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Tags className="h-6 w-6 text-primary" />Key Topics</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {keyTopics.map((topic, index) => (
                <Badge key={index} variant="secondary">{topic}</Badge>
              ))}
            </CardContent>
          </Card>
        )}
        */}


        {meeting.transcript && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ClipboardList className="h-6 w-6 text-primary" />
                Full Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 rounded-md border p-4 bg-muted/30">
                <p className="text-sm whitespace-pre-wrap">{meeting.transcript}</p>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {!meeting.summary && !meeting.transcript && (
             <div className="text-center text-muted-foreground p-4 flex flex-col items-center justify-center">
                <Info className="h-10 w-10 mb-2 opacity-50" />
                <p>No content (summary or transcript) available for this shared meeting.</p>
            </div>
        )}
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm border-t">
          <p>&copy; {new Date().getFullYear()} NotiQ Lite. Meeting notes shared publicly.</p>
      </footer>
    </div>
  );
}
