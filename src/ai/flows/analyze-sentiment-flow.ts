
'use server';
/**
 * @fileOverview A Genkit flow for analyzing the sentiment of meeting transcripts.
 *
 * - analyzeSentiment - A function that takes a meeting transcript and returns its sentiment.
 * - AnalyzeSentimentInput - The input type for the analyzeSentiment function.
 * - AnalyzeSentimentOutput - The return type for the analyzeSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSentimentInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the meeting to analyze sentiment from.'),
});
export type AnalyzeSentimentInput = z.infer<typeof AnalyzeSentimentInputSchema>;

export const SentimentSchema = z.enum(['Positive', 'Negative', 'Neutral', 'Mixed', 'N/A']);
export type Sentiment = z.infer<typeof SentimentSchema>;

const AnalyzeSentimentOutputSchema = z.object({
  sentiment: SentimentSchema.describe("The overall sentiment of the meeting (Positive, Negative, Neutral, Mixed, or N/A if not determinable)."),
  explanation: z.string().describe("A brief explanation or justification for the identified sentiment."),
});
export type AnalyzeSentimentOutput = z.infer<typeof AnalyzeSentimentOutputSchema>;

export async function analyzeSentiment(input: AnalyzeSentimentInput): Promise<AnalyzeSentimentOutput> {
  // If transcript is empty or whitespace, return N/A
  if (!input.transcript || input.transcript.trim() === "") {
    return { sentiment: 'N/A', explanation: "Transcript is empty, sentiment cannot be determined." };
  }
  return analyzeSentimentFlow(input);
}

const analyzeSentimentPrompt = ai.definePrompt({
  name: 'analyzeSentimentPrompt',
  input: {schema: AnalyzeSentimentInputSchema},
  output: {schema: AnalyzeSentimentOutputSchema},
  prompt: `Analyze the following meeting transcript to determine its overall sentiment.
Consider the language used, the tone of the discussion, and any expressed emotions or attitudes.
The sentiment should be one of: Positive, Negative, Neutral, or Mixed.
If the sentiment is not clearly determinable or the transcript is too short/vague, classify it as N/A.
Provide a brief (1-2 sentences) explanation for your sentiment classification.

Transcript:
{{{transcript}}}

Return the sentiment and explanation.
`,
});

const analyzeSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentFlow',
    inputSchema: AnalyzeSentimentInputSchema,
    outputSchema: AnalyzeSentimentOutputSchema,
  },
  async input => {
    const {output} = await analyzeSentimentPrompt(input);
    return output || { sentiment: 'N/A', explanation: "Failed to determine sentiment." };
  }
);
