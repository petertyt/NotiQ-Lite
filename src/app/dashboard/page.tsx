
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { AudioInputForm } from '@/components/audio-input-form';
import { LiveAudioRecorder } from '@/components/live-audio-recorder';
import { SummaryDisplay } from '@/components/summary-display';
import { AskNotiQChat, type Message } from '@/components/ask-notiq-chat';
import { ExportControls } from '@/components/export-controls';
import { ActionItemsDisplay } from '@/components/action-items-display';
import { KeyTopicsDisplay } from '@/components/key-topics-display';
import { SentimentDisplay } from '@/components/sentiment-display';
import { transcribeAudio } from '@/ai/flows/transcribe-audio-flow';
import { summarizeMeeting, type SummaryLength, type TemplateFocus } from '@/ai/flows/summarize-meeting';
import { askNotiQ } from '@/ai/flows/ask-notiq';
import { extractActionItems, type ActionItem } from '@/ai/flows/extract-action-items-flow';
import { extractKeyTopics } from '@/ai/flows/extract-key-topics-flow';
import { analyzeSentiment, type AnalyzeSentimentOutput } from '@/ai/flows/analyze-sentiment-flow';
import { refineSummary } from '@/ai/flows/refine-summary-flow';
import { createMeeting, getMeetingById, updateMeetingTitle, deleteMeeting as deleteMeetingFromDb, updateMeetingSharingStatus } from '@/services/meeting-service';
import type { Meeting } from '@/types/meeting';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { Switch } from '@/components/ui/switch';

import { ClipboardList, Loader2, LayoutDashboard, History, UserCircle, SettingsIcon, LogOut, Save, Edit3, Trash2, Tags, MessageSquareText, TextQuote, Edit, UploadCloud, Mic, FileJson, Share2, Copy } from 'lucide-react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarInset,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const readFileAsDataURI = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null);
  const [meetingTitle, setMeetingTitle] = useState<string>("");
  const [audioFileName, setAudioFileName] = useState<string | null>(null);

  const [transcript, setTranscript] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [selectedSummaryLength, setSelectedSummaryLength] = useState<SummaryLength>('standard');
  const [selectedTemplateFocus, setSelectedTemplateFocus] = useState<TemplateFocus>('standard');
  const [actionItems, setActionItems] = useState<ActionItem[] | null>(null);
  const [keyTopics, setKeyTopics] = useState<string[] | null>(null);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<AnalyzeSentimentOutput | null>(null);
  const [askNotiQMessages, setAskNotiQMessages] = useState<Message[]>([]);
  
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingActionItems, setIsLoadingActionItems] = useState(false);
  const [isLoadingKeyTopics, setIsLoadingKeyTopics] = useState(false);
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);
  const [isLoadingAskNotiQ, setIsLoadingAskNotiQ] = useState(false);
  const [isSavingMeeting, setIsSavingMeeting] = useState(false);
  const [isUpdatingMeeting, setIsUpdatingMeeting] = useState(false);
  const [isDeletingMeeting, setIsDeletingMeeting] = useState(false);
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isEditTitleModalOpen, setIsEditTitleModalOpen] = useState(false);
  const [editableMeetingTitle, setEditableMeetingTitle] = useState("");

  const [isRefineSummaryModalOpen, setIsRefineSummaryModalOpen] = useState(false);
  const [refinementInstruction, setRefinementInstruction] = useState("");
  const [isRefiningSummary, setIsRefiningSummary] = useState(false);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>('en-US');

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentMeetingIsShared, setCurrentMeetingIsShared] = useState<boolean>(false);
  const [isUpdatingSharing, setIsUpdatingSharing] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/dashboard');
    }
  }, [user, authLoading, router]);

  const resetDashboardState = useCallback((clearUrl = true) => {
    setCurrentMeetingId(null);
    setTranscript(null);
    setSummary(null);
    setActionItems(null);
    setKeyTopics(null);
    setSentimentAnalysis(null);
    setAskNotiQMessages([]);
    setMeetingTitle("");
    setAudioFileName(null);
    setCurrentMeetingIsShared(false);
    setIsLoadingTranscription(false);
    setIsLoadingSummary(false);
    setIsLoadingActionItems(false);
    setIsLoadingKeyTopics(false);
    setIsLoadingSentiment(false);
    setRefinementInstruction("");
    if (clearUrl) {
        const currentPath = window.location.pathname;
        if (window.location.search.includes('projectId')) {
            router.replace(currentPath, { scroll: false });
        }
    }
  }, [router]);

  const runPostTranscriptionAnalyses = useCallback(async (currentTranscript: string, preferredSummaryLength: SummaryLength, preferredTemplateFocus: TemplateFocus) => {
    if (!currentTranscript || !currentTranscript.trim()) {
        toast({ title: "Transcription Complete", description: "The audio seems to be silent or contained no speech. No further analysis will be performed." });
        setTranscript(currentTranscript); 
        setSummary(null);
        setActionItems([]);
        setKeyTopics([]);
        setSentimentAnalysis({ sentiment: 'N/A', explanation: "Transcript is empty or contains no speech."});
        setIsLoadingSummary(false);
        setIsLoadingActionItems(false);
        setIsLoadingKeyTopics(false);
        setIsLoadingSentiment(false);
        return;
    }

    toast({ title: "Transcription Successful", description: "Now generating summary & other insights..." });
    setIsLoadingSummary(true);
    setIsLoadingActionItems(true);
    setIsLoadingKeyTopics(true);
    setIsLoadingSentiment(true);

    try {
        const summaryPromise = summarizeMeeting({ transcript: currentTranscript, summaryLength: preferredSummaryLength, templateFocus: preferredTemplateFocus });
        const actionItemsPromise = extractActionItems({ transcript: currentTranscript });
        const keyTopicsPromise = extractKeyTopics({ transcript: currentTranscript });
        const sentimentPromise = analyzeSentiment({ transcript: currentTranscript });

        const [summaryResult, actionItemsResult, keyTopicsResult, sentimentResult] = await Promise.all([
            summaryPromise,
            actionItemsPromise,
            keyTopicsPromise,
            sentimentPromise
        ]);
        
        setSummary(summaryResult.summary);
        setActionItems(actionItemsResult.actionItems);
        setKeyTopics(keyTopicsResult.topics);
        setSentimentAnalysis(sentimentResult);

        toast({ title: "Analysis Complete", description: "Summary, action items, key topics, and sentiment are ready." });
    } catch (err) {
        console.error("Error during post-transcription analyses:", err);
        toast({ title: "Analysis Error", description: "One or more analyses failed.", variant: "destructive"});
    } finally {
        setIsLoadingSummary(false);
        setIsLoadingActionItems(false);
        setIsLoadingKeyTopics(false);
        setIsLoadingSentiment(false);
    }
  }, [toast]);

  const loadMeeting = useCallback(async (projectId: string) => {
    if (!user || !projectId) return;
    setIsLoadingMeeting(true);
    resetDashboardState(false); 
    setCurrentMeetingId(projectId);
    toast({ title: "Loading Project", description: "Fetching your saved meeting analysis..." });
    try {
      const meeting = await getMeetingById(projectId);
      if (meeting && meeting.userId === user.uid) {
        setTranscript(meeting.transcript);
        setSummary(meeting.summary); 
        setSelectedSummaryLength(meeting.summaryLengthPreference || 'standard');
        setSelectedTemplateFocus(meeting.templateFocusPreference || 'standard'); 
        setCurrentMeetingIsShared(meeting.isShared || false);
        
        if (meeting.transcript && meeting.transcript.trim()) {
            toast({ title: "Extracting Insights...", description: "Analyzing saved transcript for action items, topics, and sentiment."});
            setIsLoadingActionItems(true);
            setIsLoadingKeyTopics(true);
            setIsLoadingSentiment(true);
            const actionItemsPromise = extractActionItems({ transcript: meeting.transcript });
            const keyTopicsPromise = extractKeyTopics({ transcript: meeting.transcript });
            const sentimentPromise = analyzeSentiment({ transcript: meeting.transcript });
            const [actionItemsResult, keyTopicsResult, sentimentResult] = await Promise.all([
                actionItemsPromise,
                keyTopicsPromise,
                sentimentPromise
            ]);
            setActionItems(actionItemsResult.actionItems);
            setKeyTopics(keyTopicsResult.topics);
            setSentimentAnalysis(sentimentResult);
            setIsLoadingActionItems(false);
            setIsLoadingKeyTopics(false);
            setIsLoadingSentiment(false);
            toast({ title: "Insights Ready", description: "Action items, key topics, and sentiment extracted."});
        } else {
            setActionItems([]);
            setKeyTopics([]);
            setSentimentAnalysis({ sentiment: 'N/A', explanation: "Saved transcript is empty or contains no speech."});
        }
        setMeetingTitle(meeting.title);
        setEditableMeetingTitle(meeting.title); 
        setAudioFileName(meeting.audioFileName || null);
        toast({ title: "Project Loaded", description: `Successfully loaded "${meeting.title}".` });
      } else if (meeting && meeting.userId !== user.uid) {
        toast({ title: "Access Denied", description: "You do not have permission to view this project.", variant: "destructive" });
        router.push('/dashboard'); 
      } else {
        toast({ title: "Project Not Found", description: "The requested meeting analysis could not be found.", variant: "destructive" });
        router.push('/dashboard'); 
      }
    } catch (error) {
      console.error("Error loading meeting:", error);
      toast({ title: "Error Loading Project", description: error instanceof Error ? error.message : "Could not load the project.", variant: "destructive" });
      router.push('/dashboard'); 
    } finally {
      setIsLoadingMeeting(false);
    }
  }, [user, router, toast, resetDashboardState]);

  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId && user && !isLoadingMeeting && projectId !== currentMeetingId) {
      loadMeeting(projectId);
    }
  }, [searchParams, user, loadMeeting, isLoadingMeeting, currentMeetingId]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logout Successful", description: "You have been logged out." });
      router.push('/'); 
    } catch (error: any) {
      toast({ title: "Logout Failed", description: error.message || "An unexpected error occurred during logout.", variant: "destructive" });
    }
  };

  const handleNewAnalysis = () => {
    resetDashboardState(true);
  };

  const handleAudioUpload = async (audioFile: File, languageCode: string) => {
    if (!user && !authLoading) {
      toast({ title: "Authentication Required", description: "Please sign in to use this feature.", variant: "destructive" });
      router.push('/auth/signin?redirect=/dashboard');
      return;
    }
    if (currentMeetingId) {
       handleNewAnalysis();
       await new Promise(resolve => setTimeout(resolve, 0)); 
    }
    
    setAudioFileName(audioFile.name); 
    setMeetingTitle(audioFile.name.substring(0, audioFile.name.lastIndexOf('.')) || `Meeting ${new Date().toLocaleString()}`);
    setSelectedLanguageCode(languageCode);

    // Reset parts of state, but keep title and audioFileName
    setTranscript(null);
    setSummary(null);
    setActionItems(null);
    setKeyTopics(null);
    setSentimentAnalysis(null);
    setAskNotiQMessages([]);
    setCurrentMeetingIsShared(false);

    setIsLoadingTranscription(true);

    try {
      toast({ title: "Transcription Started", description: "Processing your audio file..." });
      const audioDataUri = await readFileAsDataURI(audioFile);
      const transcriptionResult = await transcribeAudio({ audioDataUri, languageCode });
      
      if (!transcriptionResult || typeof transcriptionResult.transcript !== 'string') {
        throw new Error("Transcription result is invalid.");
      }
      const newTranscript = transcriptionResult.transcript;
      setTranscript(newTranscript);
      setIsLoadingTranscription(false);
      
      await runPostTranscriptionAnalyses(newTranscript, selectedSummaryLength, selectedTemplateFocus);

    } catch (error) {
      console.error("Error processing audio or generating insights:", error);
      let errorMessage = "Failed to process audio or generate insights. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message.includes("Transcription result is invalid") 
          ? "Received an invalid result from transcription service."
          : `An error occurred: ${error.message.substring(0,100)}`;
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      resetDashboardState(false); 
    } finally {
      setIsLoadingTranscription(false); 
    }
  };

  const handleAskNotiQ = async (question: string) => {
    if (!user) {
       toast({ title: "Authentication Required", variant: "destructive" });
       router.push('/auth/signin?redirect=/dashboard' + (currentMeetingId ? `?projectId=${currentMeetingId}` : ''));
       return;
    }
    if (!transcript) {
      toast({ title: "No Transcript", description: "Please upload an audio file or load a project first.", variant: "destructive" });
      return;
    }

    const newUserMessage: Message = { id: `${Date.now()}-user`, sender: 'user', text: question };
    setAskNotiQMessages(prev => [...prev, newUserMessage]);
    setIsLoadingAskNotiQ(true);

    try {
      const result = await askNotiQ({ transcript, question });
      const aiResponse: Message = { id: `${Date.now()}-ai`, sender: 'ai', text: result.answer };
      setAskNotiQMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error asking NotiQ:", error);
      const errorResponse: Message = { id: `${Date.now()}-ai-error`, sender: 'ai', text: "Sorry, I couldn't process that question. Please try again." };
      setAskNotiQMessages(prev => [...prev, errorResponse]);
      toast({ title: "Error", description: "Failed to get answer from NotiQ. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingAskNotiQ(false);
    }
  };

  const handleSaveNewMeeting = async () => {
    if (!user) {
      toast({ title: "Authentication Required", variant: "destructive" }); return;
    }
    if (!transcript && !summary) { 
      toast({ title: "Nothing to Save", variant: "destructive" }); return;
    }
    if (!meetingTitle.trim()) {
      toast({ title: "Title Required", variant: "destructive" }); return;
    }

    setIsSavingMeeting(true);
    try {
      const meetingData: Omit<Meeting, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isShared'> = {
        title: meetingTitle.trim(),
        audioFileName: audioFileName,
        transcript,
        summary,
        summaryLengthPreference: selectedSummaryLength,
        templateFocusPreference: selectedTemplateFocus,
      };
      const newMeetingId = await createMeeting(user.uid, meetingData);
      setCurrentMeetingId(newMeetingId); 
      setCurrentMeetingIsShared(false); // New meetings are not shared by default
      router.replace(`/dashboard?projectId=${newMeetingId}`, { scroll: false });
      toast({ title: "Meeting Saved", description: `"${meetingTitle.trim()}" has been successfully saved.` });
      setIsSaveModalOpen(false); 
    } catch (error) {
      console.error("Error saving meeting:", error);
      toast({ title: "Save Failed", description: error instanceof Error ? error.message : "Could not save meeting.", variant: "destructive" });
    } finally {
      setIsSavingMeeting(false);
    }
  };

  const handleUpdateMeetingTitle = async () => {
    if (!user || !currentMeetingId || !editableMeetingTitle.trim()) {
      toast({ title: "Invalid Data", description: "User, Meeting ID, or new title is missing.", variant: "destructive" });
      return;
    }
    setIsUpdatingMeeting(true);
    try {
      await updateMeetingTitle(currentMeetingId, editableMeetingTitle.trim());
      setMeetingTitle(editableMeetingTitle.trim());
      toast({ title: "Title Updated", description: "Meeting title has been successfully updated." });
      setIsEditTitleModalOpen(false);
    } catch (error) {
      console.error("Error updating meeting title:", error);
      toast({ title: "Update Failed", description: error instanceof Error ? error.message : "Could not update title.", variant: "destructive" });
    } finally {
      setIsUpdatingMeeting(false);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!user || !currentMeetingId) {
      toast({ title: "Cannot Delete", description: "No project loaded or user not authenticated.", variant: "destructive" });
      return;
    }
    setIsDeletingMeeting(true);
    try {
      await deleteMeetingFromDb(currentMeetingId);
      toast({ title: "Project Deleted", description: `"${meetingTitle}" has been successfully deleted.` });
      handleNewAnalysis(); 
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast({ title: "Delete Failed", description: error instanceof Error ? error.message : "Could not delete project.", variant: "destructive" });
    } finally {
      setIsDeletingMeeting(false);
    }
  };

  const handleRefineSummary = async () => {
    if (!summary || !refinementInstruction.trim()) {
      toast({ title: "Missing Information", description: "Cannot refine summary without a summary or instruction.", variant: "destructive" });
      return;
    }
    setIsRefiningSummary(true);
    toast({ title: "Refining Summary...", description: "AI is working on your request." });
    try {
      const result = await refineSummary({
        currentSummary: summary,
        refinementInstruction: refinementInstruction,
      });
      setSummary(result.refinedSummary);
      toast({ title: "Summary Refined", description: "The summary has been updated." });
      setIsRefineSummaryModalOpen(false);
      setRefinementInstruction(""); 
    } catch (error) {
      console.error("Error refining summary:", error);
      toast({ title: "Refinement Failed", description: "Could not refine summary. Please try again.", variant: "destructive" });
    } finally {
      setIsRefiningSummary(false);
    }
  };

  const handleToggleSharing = async (newSharedStatus: boolean) => {
    if (!user || !currentMeetingId) {
      toast({ title: "Cannot update sharing", description: "No project loaded or user not authenticated.", variant: "destructive" });
      return;
    }
    setIsUpdatingSharing(true);
    try {
      await updateMeetingSharingStatus(currentMeetingId, user.uid, newSharedStatus);
      setCurrentMeetingIsShared(newSharedStatus);
      toast({ title: "Sharing Status Updated", description: `Project sharing is now ${newSharedStatus ? 'ON' : 'OFF'}.` });
    } catch (error) {
      console.error("Error updating sharing status:", error);
      toast({ title: "Update Failed", description: error instanceof Error ? error.message : "Could not update sharing status.", variant: "destructive" });
    } finally {
      setIsUpdatingSharing(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!currentMeetingId || typeof window === 'undefined') return;
    const shareLink = `${window.location.origin}/share/${currentMeetingId}`;
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        toast({ title: "Link Copied!", description: "Shareable link copied to clipboard." });
      })
      .catch(err => {
        console.error('Failed to copy share link: ', err);
        toast({ title: "Copy Failed", description: "Could not copy link. Please try manually.", variant: "destructive" });
      });
  };
  
  if (!isClient || authLoading || (!user && !authLoading)) {
    return ( 
      <div className="flex flex-col items-center justify-center text-center py-10 min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          {authLoading ? 'Verifying session...' : 'Redirecting to sign-in...'}
        </p>
      </div>
    );
  }
  
  const canSaveNew = (transcript || summary) && !currentMeetingId;
  const isProcessingAnyInsights = isLoadingSummary || isLoadingActionItems || isLoadingKeyTopics || isLoadingSentiment;
  const isProcessing = isLoadingTranscription || isProcessingAnyInsights || isLoadingMeeting || isRefiningSummary || isUpdatingSharing;

  const showProcessedContent = transcript || summary || isLoadingTranscription || isProcessingAnyInsights || isLoadingMeeting;
  const showWelcomeMessage = !showProcessedContent && !isProcessing && !currentMeetingId;
  const showAnalysisOptions = !currentMeetingId && !transcript && !isProcessing;


  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="p-4 flex items-center justify-between">
             <Button variant="outline" size="sm" onClick={handleNewAnalysis} disabled={isProcessing}>
              New Analysis
            </Button>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" passHref legacyBehavior>
                  <SidebarMenuButton isActive={!searchParams.get('projectId')} onClick={handleNewAnalysis} tooltip="New Analysis / Dashboard Home">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                 <Link href="/dashboard/projects" passHref legacyBehavior>
                    <SidebarMenuButton isActive={router.pathname === '/dashboard/projects'} tooltip="Stored Projects">
                    <History />
                    <span>Stored Projects</span>
                    </SidebarMenuButton>
                 </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => toast({title: "Coming Soon!", description: "User profile feature is under development."})} tooltip="Profile">
                  <UserCircle />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => toast({title: "Coming Soon!", description: "Settings feature is under development."})} tooltip="Settings">
                  <SettingsIcon />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Log Out">
                  <LogOut />
                  <span>Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 p-4 md:p-6 lg:p-8">
          {isLoadingMeeting ? (
            <div className="flex flex-col items-center justify-center text-center py-10 min-h-[calc(100vh-200px)]">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg text-muted-foreground">Loading project...</p>
            </div>
          ) : (
          <div className="space-y-6"> {/* Main content spacing */}
            
            {/* Audio Input and Analysis Options */}
            {!currentMeetingId && (
              <Card className="shadow-md">
                 <CardHeader>
                    <CardTitle>Start New Analysis</CardTitle>
                    <CardDescription>Upload an audio file or record live to begin.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 md:w-[400px] mb-4">
                        <TabsTrigger value="upload"><UploadCloud className="mr-2 h-5 w-5 inline-block"/> Upload File</TabsTrigger>
                        <TabsTrigger value="record"><Mic className="mr-2 h-5 w-5 inline-block"/> Record Live</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload">
                        <AudioInputForm 
                        onSubmit={handleAudioUpload} 
                        isLoading={isProcessing} 
                        currentLanguageCode={selectedLanguageCode}
                        onLanguageChange={setSelectedLanguageCode}
                        />
                    </TabsContent>
                    <TabsContent value="record">
                        <LiveAudioRecorder 
                        onRecordingComplete={handleAudioUpload} 
                        isLoadingProcessing={isProcessing}
                        selectedLanguageCode={selectedLanguageCode}
                        />
                    </TabsContent>
                    </Tabs>
                    {showAnalysisOptions && (
                        <div className="mt-6 space-y-4 p-4 border-t">
                            <h3 className="text-lg font-medium text-card-foreground mb-3">Summary Generation Options</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="summary-length-select" className="flex items-center gap-1 mb-1">
                                        <TextQuote className="h-4 w-4 text-muted-foreground"/> Summary Length
                                    </Label>
                                    <Select
                                    value={selectedSummaryLength}
                                    onValueChange={(value) => setSelectedSummaryLength(value as SummaryLength)}
                                    disabled={isProcessing || !!currentMeetingId || !!transcript} 
                                    >
                                    <SelectTrigger id="summary-length-select">
                                        <SelectValue placeholder="Select length" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="short">Short (1-2 Sentences)</SelectItem>
                                        <SelectItem value="standard">Standard (Concise Paragraph)</SelectItem>
                                        <SelectItem value="detailed">Detailed (Comprehensive)</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="template-focus-select" className="flex items-center gap-1 mb-1">
                                        <FileJson className="h-4 w-4 text-muted-foreground"/> Template Focus
                                    </Label>
                                    <Select
                                    value={selectedTemplateFocus}
                                    onValueChange={(value) => setSelectedTemplateFocus(value as TemplateFocus)}
                                    disabled={isProcessing || !!currentMeetingId || !!transcript}
                                    >
                                    <SelectTrigger id="template-focus-select">
                                        <SelectValue placeholder="Select template focus" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="standard">Standard Overview</SelectItem>
                                        <SelectItem value="decisionFocused">Decision-Focused</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <p className="text-xs text-muted-foreground mt-2">
                                These settings affect new summaries.
                            </p>
                        </div>
                    )}
                </CardContent>
              </Card>
            )}
            
            {/* Project Title and Actions */}
            {currentMeetingId && meetingTitle && (
                <Card className="shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Viewing: {meetingTitle}</CardTitle>
                      {audioFileName && <CardDescription>Original file: {audioFileName}</CardDescription>}
                    </div>
                    <div className="flex gap-2">
                        {/* Share Button */}
                        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" title="Share Project">
                                <Share2 className="h-5 w-5" />
                                <span className="sr-only">Share Project</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Share Project: {meetingTitle}</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                        id="sharing-switch"
                                        checked={currentMeetingIsShared}
                                        onCheckedChange={handleToggleSharing}
                                        disabled={isUpdatingSharing}
                                    />
                                    <Label htmlFor="sharing-switch" className="text-base">
                                        {currentMeetingIsShared ? "Sharing is ON" : "Sharing is OFF"}
                                    </Label>
                                    {isUpdatingSharing && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                  </div>
                                  {currentMeetingIsShared && currentMeetingId && (
                                    <div className="space-y-2 mt-2">
                                        <Label htmlFor="share-link-input">Shareable Link:</Label>
                                        <div className="flex gap-2">
                                        <Input id="share-link-input" value={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${currentMeetingId}`} readOnly />
                                        <Button variant="outline" size="icon" onClick={handleCopyShareLink} title="Copy link">
                                            <Copy className="h-4 w-4"/>
                                        </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Anyone with this link can view the meeting notes.</p>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>Close</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        
                        <Dialog open={isEditTitleModalOpen} onOpenChange={setIsEditTitleModalOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => setEditableMeetingTitle(meetingTitle)} title="Edit Title">
                              <Edit3 className="h-5 w-5" />
                              <span className="sr-only">Edit Title</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Edit Meeting Title</DialogTitle></DialogHeader>
                            <div className="grid gap-4 py-4">
                              <Label htmlFor="edit-meeting-title-input">Title</Label>
                              <Input id="edit-meeting-title-input" value={editableMeetingTitle} onChange={(e) => setEditableMeetingTitle(e.target.value)} placeholder="e.g., Q3 Planning Session"/>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditTitleModalOpen(false)}>Cancel</Button>
                              <Button onClick={handleUpdateMeetingTitle} disabled={isUpdatingMeeting || !editableMeetingTitle.trim()}>
                                {isUpdatingMeeting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Title
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" title="Delete Project">
                              <Trash2 className="h-5 w-5" /><span className="sr-only">Delete Project</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the project "{meetingTitle}".</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteMeeting} disabled={isDeletingMeeting} className="bg-destructive hover:bg-destructive/90">
                                {isDeletingMeeting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </CardHeader>
                </Card>
              )}

            {/* Save New Meeting Button */}
            {canSaveNew && (transcript || summary) && !isProcessing && (
              <div className="flex justify-end">
                <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => { /* Title logic remains */ setIsSaveModalOpen(true); }}>
                      <Save className="mr-2 h-5 w-5" /> Save Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Save New Meeting Analysis</DialogTitle><DialogDescription>Enter a title for this meeting analysis.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                       <Label htmlFor="meeting-title-input">Title</Label>
                       <Input id="meeting-title-input" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} placeholder="e.g., Q3 Planning Session"/>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsSaveModalOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveNewMeeting} disabled={isSavingMeeting || !meetingTitle.trim()}>
                        {isSavingMeeting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Main Analysis Content Area */}
            {showProcessedContent && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column (Transcript and secondary insights) */}
                    <div className="md:col-span-2 space-y-6">
                        {transcript || (isLoadingTranscription && !transcript) ? (
                            <Card className="shadow-lg h-full flex flex-col">
                                <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-6 w-6 text-primary" />
                                    <span>{isLoadingTranscription && !transcript ? "Transcribing Audio..." : "Meeting Transcript"}</span>
                                </CardTitle>
                                <CardDescription>
                                    {isLoadingTranscription && !transcript ? "Please wait while we process your audio." : "The full text from your meeting audio."}
                                </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                {isLoadingTranscription && !transcript ? (
                                    <div className="space-y-3 pt-2">
                                        <div className="h-4 bg-muted rounded w-full animate-pulse"></div><div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div><div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                                    </div>
                                ) : transcript ? (
                                    <ScrollArea className="h-72 rounded-md border p-4 bg-muted/30"><p className="text-sm whitespace-pre-wrap">{transcript}</p></ScrollArea>
                                ) : (
                                    <div className="text-center text-muted-foreground p-4 h-72 flex flex-col justify-center items-center"><ClipboardList className="h-10 w-10 mb-2 opacity-50" /><p>Your transcript will appear here.</p></div>
                                )}
                                </CardContent>
                            </Card>
                        ) : null}

                        {(actionItems || (isLoadingActionItems && transcript)) && (isLoadingKeyTopics || keyTopics) ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ActionItemsDisplay actionItems={actionItems} isLoading={isLoadingActionItems && !!transcript} isTranscriptionLoading={isLoadingTranscription && !transcript} />
                                <KeyTopicsDisplay topics={keyTopics} isLoading={isLoadingKeyTopics && !!transcript} isTranscriptionLoading={isLoadingTranscription && !transcript} />
                            </div>
                        ) : null}
                    </div>

                    {/* Right Column (Summary, Sentiment, Chat, Export) */}
                    <div className="md:col-span-1 space-y-6">
                        {(summary || (isLoadingSummary && transcript)) && (
                            <SummaryDisplay summary={summary} isLoading={isLoadingSummary && !!transcript} isTranscriptionLoading={isLoadingTranscription && !transcript} canRefine={!!summary && !isProcessing} onRefineClick={() => setIsRefineSummaryModalOpen(true)} />
                        )}
                        {(sentimentAnalysis || (isLoadingSentiment && transcript)) && (
                            <SentimentDisplay sentimentAnalysis={sentimentAnalysis} isLoading={isLoadingSentiment && !!transcript} isTranscriptionLoading={isLoadingTranscription && !transcript} />
                        )}
                        {(transcript || summary) && (
                            <AskNotiQChat messages={askNotiQMessages} onSendMessage={handleAskNotiQ} isLoading={isLoadingAskNotiQ} transcriptProvided={!!transcript && !isLoadingTranscription && !isLoadingMeeting}/>
                        )}
                        {(transcript || summary) && (
                            <ExportControls meetingTitle={meetingTitle} transcript={transcript} summary={summary} actionItems={actionItems} keyTopics={keyTopics}/>
                        )}
                    </div>
                </div>
            )}
            
            {/* Welcome Message */}
            {showWelcomeMessage && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Welcome to your NotiQ Lite Dashboard!</CardTitle>
                  <CardDescription>Upload an audio file, record live, or load a stored project to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Once you provide audio, this area will populate with the transcript, summary, action items, key topics, sentiment analysis, chat interface, and export options.</p>
                </CardContent>
              </Card>
            )}
          </div>
          )} 

          {/* Refine Summary Dialog */}
          <Dialog open={isRefineSummaryModalOpen} onOpenChange={setIsRefineSummaryModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5 text-primary" />Refine Meeting Summary</DialogTitle>
                <DialogDescription>Provide instructions to the AI on how to modify the current summary.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current Summary (for context):</Label>
                  <ScrollArea className="h-32 mt-1 rounded-md border p-3 bg-muted/30 text-sm"><p className="whitespace-pre-wrap">{summary || "No summary available."}</p></ScrollArea>
                </div>
                <div>
                  <Label htmlFor="refinement-instruction">Refinement Instruction:</Label>
                  <Textarea id="refinement-instruction" placeholder="e.g., Make it more concise. Focus on decisions..." value={refinementInstruction} onChange={(e) => setRefinementInstruction(e.target.value)} className="mt-1 min-h-[80px]" disabled={isRefiningSummary}/>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRefineSummaryModalOpen(false)} disabled={isRefiningSummary}>Cancel</Button>
                <Button onClick={handleRefineSummary} disabled={isRefiningSummary || !refinementInstruction.trim() || !summary}>
                  {isRefiningSummary && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Refine Summary
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
