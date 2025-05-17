
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-meeting.ts';
import '@/ai/flows/ask-notiq.ts';
import '@/ai/flows/transcribe-audio-flow.ts';
import '@/ai/flows/extract-action-items-flow.ts';
import '@/ai/flows/extract-key-topics-flow.ts';
import '@/ai/flows/analyze-sentiment-flow.ts';
import '@/ai/flows/refine-summary-flow.ts'; // New Import
