
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMeetingsForUser, deleteMeeting as deleteMeetingFromDb } from '@/services/meeting-service';
import type { Meeting } from '@/types/meeting';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, History, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function StoredProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [isDeletingMeeting, setIsDeletingMeeting] = useState<string | null>(null); // Store ID of meeting being deleted

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/dashboard/projects');
    } else if (user) {
      fetchMeetings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const fetchMeetings = async () => {
    if (!user) return;
    setIsLoadingMeetings(true);
    try {
      const userMeetings = await getMeetingsForUser(user.uid);
      setMeetings(userMeetings);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
      toast({
        title: "Error Fetching Projects",
        description: error instanceof Error ? error.message : "Could not load your saved projects.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMeetings(false);
    }
  };

  const handleDeleteMeeting = async (meetingId: string, meetingTitle: string) => {
    if (!user) return;
    setIsDeletingMeeting(meetingId);
    try {
      await deleteMeetingFromDb(meetingId);
      toast({ title: "Project Deleted", description: `"${meetingTitle}" has been successfully deleted.` });
      setMeetings(prevMeetings => prevMeetings.filter(m => m.id !== meetingId)); // Optimistic update
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Could not delete the project.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingMeeting(null);
    }
  };


  if (authLoading || isLoadingMeetings) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 min-h-[calc(100vh-var(--header-height,100px)-var(--footer-height,50px))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          {authLoading ? 'Verifying session...' : 'Loading your projects...'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div >
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <History className="h-8 w-8" />
            Stored Projects
          </h1>
          <p className="text-muted-foreground">Access and manage your saved meeting analyses.</p>
        </div>
        <Button onClick={() => router.push('/dashboard')} >
          <PlusCircle className="mr-2 h-5 w-5" />
          New Analysis
        </Button>
      </div>

      {meetings.length === 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>No Stored Projects Yet</CardTitle>
            <CardDescription>Start by analyzing a new meeting on your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Once you save an analysis from the dashboard, it will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
            <CardHeader>
              <CardTitle className="truncate text-xl">{meeting.title}</CardTitle>
              <CardDescription>
                Saved {meeting.createdAt ? formatDistanceToNow(meeting.createdAt.toDate(), { addSuffix: true }) : 'some time ago'}
                <br />
                Last updated: {meeting.updatedAt ? formatDistanceToNow(meeting.updatedAt.toDate(), { addSuffix: true }) : 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {meeting.summary || (meeting.transcript ? meeting.transcript.substring(0,150) + "..." : 'No summary or transcript preview available.')}
              </p>
            </CardContent>
            <CardFooter className="pt-0 border-t mt-auto flex flex-col gap-2"> {/* Changed from CardContent to CardFooter */}
               <Link href={`/dashboard?projectId=${meeting.id}`} passHref className="w-full">
                <Button variant="outline" className="w-full mt-4">
                  <FileText className="mr-2 h-4 w-4" /> View Details
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full" disabled={isDeletingMeeting === meeting.id}>
                    {isDeletingMeeting === meeting.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the project titled "{meeting.title}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteMeeting(meeting.id, meeting.title)}
                      disabled={isDeletingMeeting === meeting.id}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeletingMeeting === meeting.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Yes, delete it
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
