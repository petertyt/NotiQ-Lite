
'use server';
/**
 * @fileOverview A Genkit flow for extracting key topics/tags from meeting transcripts.
 *
 * - extractKeyTopics - A function that takes a meeting transcript and returns a list of identified key topics.
 * - ExtractKeyTopicsInput - The input type for the extractKeyTopics function.
 * - ExtractKeyTopicsOutput - The return type for the extractKeyTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractKeyTopicsInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the meeting to extract key topics from.'),
});
export type ExtractKeyTopicsInput = z.infer<typeof ExtractKeyTopicsInputSchema>;

const ExtractKeyTopicsOutputSchema = z.object({
  topics: z.array(z.string().describe("A key topic, subject, or keyword identified from the transcript.")).describe('A list of key topics (as strings) identified from the transcript. Aim for 5-7 concise and meaningful tags.'),
});
export type ExtractKeyTopicsOutput = z.infer<typeof ExtractKeyTopicsOutputSchema>;

export async function extractKeyTopics(input: ExtractKeyTopicsInput): Promise<ExtractKeyTopicsOutput> {
  // If transcript is empty or whitespace, return empty list
  if (!input.transcript || input.transcript.trim() === "") {
    return { topics: [] };
  }
  return extractKeyTopicsFlow(input);
}

const extractKeyTopicsPrompt = ai.definePrompt({
  name: 'extractKeyTopicsPrompt',
  input: {schema: ExtractKeyTopicsInputSchema},
  output: {schema: ExtractKeyTopicsOutputSchema},
  prompt: `Analyze the following meeting transcript and identify the main topics, subjects, or keywords discussed.
Provide a list of these topics as concise, meaningful tags that represent the core themes of the discussion.
Return up to 5-7 key topics.

Transcript:
{{{transcript}}}

Return the identified key topics. If no distinct topics are found, return an empty list.
`,
});

const extractKeyTopicsFlow = ai.defineFlow(
  {
    name: 'extractKeyTopicsFlow',
    inputSchema: ExtractKeyTopicsInputSchema,
    outputSchema: ExtractKeyTopicsOutputSchema,
  },
  async input => {
    const {output} = await extractKeyTopicsPrompt(input);
    return output || { topics: [] }; // Ensure a valid output structure
  }
);
