
'use server';
/**
 * @fileOverview A Genkit flow for extracting action items from meeting transcripts.
 *
 * - extractActionItems - A function that takes a meeting transcript and returns a list of identified action items.
 * - ExtractActionItemsInput - The input type for the extractActionItems function.
 * - ExtractActionItemsOutput - The return type for the extractActionItems function.
 * - ActionItem - The structure for an individual action item.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractActionItemsInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the meeting to extract action items from.'),
});
export type ExtractActionItemsInput = z.infer<typeof ExtractActionItemsInputSchema>;

export const ActionItemSchema = z.object({
  description: z.string().describe("The detailed description of the action item or task."),
  assignee: z.string().optional().describe("The person or entity assigned to the action item, if mentioned."),
  dueDate: z.string().optional().describe("The due date or timeframe for the action item, if specified."),
});
export type ActionItem = z.infer<typeof ActionItemSchema>;

const ExtractActionItemsOutputSchema = z.object({
  actionItems: z.array(ActionItemSchema).describe('A list of action items identified from the transcript. Each item includes a description, and optionally an assignee and due date.'),
});
export type ExtractActionItemsOutput = z.infer<typeof ExtractActionItemsOutputSchema>;

export async function extractActionItems(input: ExtractActionItemsInput): Promise<ExtractActionItemsOutput> {
  // If transcript is empty or whitespace, return empty list
  if (!input.transcript || input.transcript.trim() === "") {
    return { actionItems: [] };
  }
  return extractActionItemsFlow(input);
}

const extractActionItemsPrompt = ai.definePrompt({
  name: 'extractActionItemsPrompt',
  input: {schema: ExtractActionItemsInputSchema},
  output: {schema: ExtractActionItemsOutputSchema},
  prompt: `Analyze the following meeting transcript and identify all specific action items, tasks, or commitments.
For each action item, extract:
1.  The core task or action to be performed (description).
2.  Who is responsible for it (assignee), if mentioned.
3.  Any deadline or due date (dueDate), if mentioned.

If an assignee or due date is not explicitly mentioned for an action item, omit those fields.
Focus on clear, actionable tasks. Avoid general discussion points unless they clearly lead to a defined action.

Transcript:
{{{transcript}}}

Return the identified action items. If no action items are found, return an empty list.
`,
});

const extractActionItemsFlow = ai.defineFlow(
  {
    name: 'extractActionItemsFlow',
    inputSchema: ExtractActionItemsInputSchema,
    outputSchema: ExtractActionItemsOutputSchema,
  },
  async input => {
    const {output} = await extractActionItemsPrompt(input);
    return output || { actionItems: [] }; // Ensure a valid output structure
  }
);
