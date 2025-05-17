
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Info, Loader2, Edit } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SummaryDisplayProps {
  summary: string | null;
  isLoading: boolean;
  isTranscriptionLoading?: boolean; 
  className?: string;
  onRefineClick?: () => void; // New prop
  canRefine?: boolean; // New prop to control button visibility/state
}

export function SummaryDisplay({ summary, isLoading, isTranscriptionLoading, className, onRefineClick, canRefine }: SummaryDisplayProps) {
  if (isTranscriptionLoading) { 
    return (
      <Card className={cn("shadow-lg h-full flex flex-col", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Meeting Summary</span>
          </CardTitle>
           <CardDescription>
            Waiting for transcript to generate summary...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-3 pt-2">
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
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
            <span>Generating Summary...</span>
          </CardTitle>
           <CardDescription>
            AI is creating a concise overview of your meeting.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-3 pt-2">
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) { 
    return (
       <Card className={cn("shadow-lg h-full flex flex-col", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Meeting Summary</span>
          </CardTitle>
           <CardDescription>
            AI-generated concise overview of your meeting.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
           <div className="text-center text-muted-foreground p-4 h-60 flex flex-col justify-center items-center">
            <Info className="h-10 w-10 mb-2 opacity-50" />
            <p>Your summary will appear here once available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-lg h-full flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Meeting Summary</span>
          </CardTitle>
          <CardDescription>AI-generated concise overview of your meeting.</CardDescription>
        </div>
        {canRefine && onRefineClick && (
          <Button variant="outline" size="sm" onClick={onRefineClick} className="ml-auto">
            <Edit className="mr-2 h-4 w-4" />
            Refine
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-60 rounded-md border p-4 bg-background">
          <p className="text-sm whitespace-pre-wrap">{summary}</p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
