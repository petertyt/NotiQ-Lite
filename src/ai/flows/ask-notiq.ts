'use server';

/**
 * @fileOverview This file defines the Genkit flow for the "Ask NotiQ" feature.
 *
 * It allows users to ask questions about a meeting transcript and receive AI-powered answers.
 * - askNotiQ - A function that handles the question answering process.
 * - AskNotiQInput - The input type for the askNotiQ function.
 * - AskNotiQOutput - The return type for the askNotiQ function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskNotiQInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the meeting.'),
  question: z.string().describe('The question to ask about the meeting.'),
});
export type AskNotiQInput = z.infer<typeof AskNotiQInputSchema>;

const AskNotiQOutputSchema = z.object({
  answer: z.string().describe('The AI-powered answer to the question.'),
});
export type AskNotiQOutput = z.infer<typeof AskNotiQOutputSchema>;

export async function askNotiQ(input: AskNotiQInput): Promise<AskNotiQOutput> {
  return askNotiQFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askNotiQPrompt',
  input: {schema: AskNotiQInputSchema},
  output: {schema: AskNotiQOutputSchema},
  prompt: `You are an AI-powered meeting assistant named NotiQ.

You have access to the transcript of a meeting and will answer questions about it.

Meeting Transcript:
{{{transcript}}}

Question: {{{question}}}

Answer:`,
});

const askNotiQFlow = ai.defineFlow(
  {
    name: 'askNotiQFlow',
    inputSchema: AskNotiQInputSchema,
    outputSchema: AskNotiQOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
