
import type { Timestamp } from 'firebase/firestore';
import type { SummaryLength, TemplateFocus } from '@/ai/flows/summarize-meeting'; 

export interface Meeting {
  id?: string; 
  userId: string;
  title: string;
  audioFileName?: string | null; 
  transcript: string | null;
  summary: string | null;
  summaryLengthPreference?: SummaryLength; 
  templateFocusPreference?: TemplateFocus;
  isShared?: boolean; // Added for sharing
  // languageCode?: string; 
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

