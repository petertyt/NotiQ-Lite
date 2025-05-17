
"use client";

import type { ActionItem } from '@/ai/flows/extract-action-items-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ListChecks, Loader2, Info, CalendarPlus } from 'lucide-react';
import { format } from 'date-fns';

interface ActionItemsDisplayProps {
  actionItems: ActionItem[] | null;
  isLoading: boolean;
  isTranscriptionLoading?: boolean;
}

export function ActionItemsDisplay({ actionItems, isLoading, isTranscriptionLoading }: ActionItemsDisplayProps) {

  const handleAddToCalendar = (item: ActionItem) => {
    if (!item.dueDate) return;

    const title = encodeURIComponent(item.description);
    let datesQueryParam = '';

    // Try to parse the dueDate
    // This is a simple parsing attempt. More robust parsing might be needed for natural language dates.
    let startDate: Date | null = null;
    try {
      const parsedDate = new Date(item.dueDate);
      // Check if the parsedDate is valid and not "Invalid Date"
      // Also check if the original dueDate string has some numbers, suggesting it might be a date
      // and is not just a year (e.g. "2024" which Date constructor treats as 2024-01-01)
      if (!isNaN(parsedDate.getTime()) && /\d/.test(item.dueDate) && item.dueDate.length > 4) {
        startDate = parsedDate;
      }
    } catch (e) {
      // Could not parse, startDate remains null
      console.warn("Could not parse due date for calendar event:", item.dueDate);
    }

    if (startDate) {
      // Format for Google Calendar: YYYYMMDDTHHmmSSZ/YYYYMMDDTHHmmSSZ (UTC)
      // or YYYYMMDD/YYYYMMDD for all-day events
      // For simplicity, let's assume it's an all-day event if no time is specified by AI.
      // If AI provides time, new Date() should capture it.
      
      // Check if the date string suggests a time was included
      const hasTime = /[T\s]?\d{1,2}:\d{2}/.test(item.dueDate || "");

      if (hasTime) {
        const startDateTime = format(startDate, "yyyyMMdd'T'HHmmss");
        // Assume a 1-hour duration if only a start date/time is clear
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        const endDateTime = format(endDate, "yyyyMMdd'T'HHmmss");
        datesQueryParam = `&dates=${startDateTime}/${endDateTime}`;
      } else {
        // All-day event: format as YYYYMMDD/YYYYMMDD (start day / day after start day for a single day event)
        const startDay = format(startDate, "yyyyMMdd");
        const dayAfterStartDate = new Date(startDate);
        dayAfterStartDate.setDate(startDate.getDate() + 1);
        const endDay = format(dayAfterStartDate, "yyyyMMdd");
        datesQueryParam = `&dates=${startDay}/${endDay}`;
      }

    }
    
    const detailsParts = [];
    if(item.assignee) detailsParts.push(`Assignee: ${item.assignee}`);
    if(!startDate && item.dueDate) detailsParts.push(`Due: ${item.dueDate}`); // Add raw due date to details if not parsed

    const details = encodeURIComponent(detailsParts.join('\n'));

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}${datesQueryParam}&details=${details}`;
    window.open(googleCalendarUrl, '_blank');
  };


  if (isTranscriptionLoading) {
    return (
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            <span>Action Items</span>
          </CardTitle>
          <CardDescription>
            Waiting for transcript to extract action items...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-3 pt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded w-full animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <span>Extracting Action Items...</span>
          </CardTitle>
          <CardDescription>
            AI is identifying tasks and commitments from the transcript.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-3 pt-2">
            {[...Array(3)].map((_, i) => (
               <div key={i} className="space-y-1">
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse ml-2"></div>
               </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!actionItems || actionItems.length === 0) {
    return (
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            <span>Action Items</span>
          </CardTitle>
          <CardDescription>
            Tasks and commitments identified from the meeting.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="text-center text-muted-foreground p-4 h-60 flex flex-col justify-center items-center">
            <Info className="h-10 w-10 mb-2 opacity-50" />
            <p>No action items were identified, or transcript is pending.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          <span>Action Items</span>
        </CardTitle>
        <CardDescription>Tasks and commitments identified from the meeting.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-60 rounded-md border p-4 bg-background">
          {actionItems.length > 0 ? (
            <ul className="space-y-3">
              {actionItems.map((item, index) => (
                <li key={index} className="text-sm p-3 rounded-md bg-muted/40 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-card-foreground">{item.description}</p>
                      {item.assignee && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-semibold">Assignee:</span> {item.assignee}
                        </p>
                      )}
                      {item.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold">Due:</span> {item.dueDate}
                        </p>
                      )}
                    </div>
                    {item.dueDate && ( // Only show button if dueDate exists
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-2 flex-shrink-0 h-8 w-8"
                        onClick={() => handleAddToCalendar(item)}
                        title="Add to Google Calendar"
                      >
                        <CalendarPlus className="h-4 w-4" />
                        <span className="sr-only">Add to Calendar</span>
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No action items identified.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

