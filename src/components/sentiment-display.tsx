
"use client";

import type { AnalyzeSentimentOutput, Sentiment } from '@/ai/flows/analyze-sentiment-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Smile, Frown, Meh, Info, Loader2, MessageSquareHeart, MessageSquareWarning, MessageSquareQuestion, MessageSquareText } from 'lucide-react'; // Added more specific icons
import { cn } from '@/lib/utils';

interface SentimentDisplayProps {
  sentimentAnalysis: AnalyzeSentimentOutput | null;
  isLoading: boolean;
  isTranscriptionLoading?: boolean;
  className?: string;
}

const sentimentIcons: Record<Sentiment, React.ElementType> = {
  Positive: Smile,
  Negative: Frown,
  Neutral: Meh,
  Mixed: MessageSquareHeart, // Using this for mixed, can be changed
  'N/A': MessageSquareQuestion,
};

const sentimentColors: Record<Sentiment, string> = {
  Positive: 'text-green-600', // Tailwind green
  Negative: 'text-red-600',   // Tailwind red
  Neutral: 'text-primary', // Using primary for neutral
  Mixed: 'text-yellow-600', // Tailwind yellow for mixed
  'N/A': 'text-muted-foreground',
}

export function SentimentDisplay({ sentimentAnalysis, isLoading, isTranscriptionLoading, className }: SentimentDisplayProps) {
  const SentimentIcon = sentimentAnalysis?.sentiment ? sentimentIcons[sentimentAnalysis.sentiment] : Info;
  const iconColorClass = sentimentAnalysis?.sentiment ? sentimentColors[sentimentAnalysis.sentiment] : 'text-muted-foreground';

  if (isTranscriptionLoading) {
    return (
      <Card className={cn("shadow-lg h-full flex flex-col", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="h-6 w-6 text-primary" /> {/* Generic Icon */}
            <span>Overall Sentiment</span>
          </CardTitle>
          <CardDescription>
            Waiting for transcript to analyze sentiment...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-3 pt-2">
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn("shadow-lg h-full flex flex-col", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <span>Analyzing Sentiment...</span>
          </CardTitle>
          <CardDescription>
            AI is determining the emotional tone of the meeting.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                <div className="h-6 w-24 bg-muted rounded-md animate-pulse"></div>
            </div>
            <div className="h-4 bg-muted rounded w-full animate-pulse mt-2"></div>
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sentimentAnalysis || sentimentAnalysis.sentiment === 'N/A') {
    return (
      <Card className={cn("shadow-lg h-full flex flex-col", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SentimentIcon className={cn("h-6 w-6", iconColorClass)} />
            <span>Overall Sentiment</span>
          </CardTitle>
          <CardDescription>
            The emotional tone of the meeting discussion.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="text-center text-muted-foreground p-4 h-60 flex flex-col justify-center items-center">
            <Info className="h-10 w-10 mb-2 opacity-50" />
            <p>{sentimentAnalysis?.explanation || "Sentiment could not be determined, or transcript is pending."}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-lg h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SentimentIcon className={cn("h-7 w-7", iconColorClass)} />
          <span className={cn("text-2xl font-semibold", iconColorClass)}>{sentimentAnalysis.sentiment}</span>
        </CardTitle>
        <CardDescription>The overall emotional tone of the meeting.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
         <ScrollArea className="h-60 rounded-md border p-4 bg-background">
            <p className="text-sm text-card-foreground">{sentimentAnalysis.explanation}</p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
