
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tags, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyTopicsDisplayProps {
  topics: string[] | null;
  isLoading: boolean;
  isTranscriptionLoading?: boolean;
  className?: string;
}

export function KeyTopicsDisplay({ topics, isLoading, isTranscriptionLoading, className }: KeyTopicsDisplayProps) {
  if (isTranscriptionLoading) {
    return (
      <Card className={cn("shadow-lg h-full flex flex-col", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-6 w-6 text-primary" />
            <span>Key Topics</span>
          </CardTitle>
          <CardDescription>
            Waiting for transcript to extract key topics...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-2 pt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-wrap gap-2">
                <div className="h-6 w-20 bg-muted rounded-full animate-pulse"></div>
                <div className="h-6 w-24 bg-muted rounded-full animate-pulse"></div>
              </div>
            ))}
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
            <span>Extracting Key Topics...</span>
          </CardTitle>
          <CardDescription>
            AI is identifying main subjects from the transcript.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
           <div className="space-y-2 pt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-wrap gap-2">
                <div className="h-6 w-20 bg-muted rounded-full animate-pulse"></div>
                <div className="h-6 w-24 bg-muted rounded-full animate-pulse"></div>
                <div className="h-6 w-16 bg-muted rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topics || topics.length === 0) {
    return (
      <Card className={cn("shadow-lg h-full flex flex-col", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-6 w-6 text-primary" />
            <span>Key Topics</span>
          </CardTitle>
          <CardDescription>
            Main subjects or keywords from the meeting.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="text-center text-muted-foreground p-4 h-60 flex flex-col justify-center items-center">
            <Info className="h-10 w-10 mb-2 opacity-50" />
            <p>No key topics were identified, or transcript is pending.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-lg h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-6 w-6 text-primary" />
          <span>Key Topics</span>
        </CardTitle>
        <CardDescription>Main subjects or keywords from the meeting.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-60 rounded-md border p-4 bg-background">
          {topics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, index) => (
                <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                  {topic}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No key topics identified.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
