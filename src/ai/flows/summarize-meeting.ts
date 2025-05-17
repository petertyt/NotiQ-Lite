
'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing meeting transcripts.
 *
 * - summarizeMeeting - A function that takes a meeting transcript and returns a concise paragraph summary.
 * - SummarizeMeetingInput - The input type for the summarizeMeeting function.
 * - SummarizeMeetingOutput - The return type for the summarizeMeeting function.
 * - SummaryLengthSchema - Zod schema for summary length options.
 * - SummaryLength - Type for summary length.
 * - TemplateFocusSchema - Zod schema for summary template focus options.
 * - TemplateFocus - Type for summary template focus.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SummaryLengthSchema = z.enum(['short', 'standard', 'detailed']).describe("The desired length of the summary: 'short' (1-2 sentences), 'standard' (a concise paragraph), or 'detailed' (a more comprehensive paragraph).");
export type SummaryLength = z.infer<typeof SummaryLengthSchema>;

export const TemplateFocusSchema = z.enum(['standard', 'decisionFocused']).describe("The desired structural focus for the summary: 'standard' (balanced overview) or 'decisionFocused' (emphasis on decisions).");
export type TemplateFocus = z.infer<typeof TemplateFocusSchema>;

const SummarizeMeetingInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the meeting to be summarized.'),
  summaryLength: SummaryLengthSchema.optional().default('standard'),
  templateFocus: TemplateFocusSchema.optional().default('standard'),
});
export type SummarizeMeetingInput = z.infer<typeof SummarizeMeetingInputSchema>;

const SummarizeMeetingOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summary of the meeting transcript, with length and detail based on user preference.'),
});
export type SummarizeMeetingOutput = z.infer<typeof SummarizeMeetingOutputSchema>;

export async function summarizeMeeting(input: SummarizeMeetingInput): Promise<SummarizeMeetingOutput> {
  if (!input.transcript || input.transcript.trim() === "") {
    return { summary: "Transcript is empty, no summary can be generated." };
  }
  return summarizeMeetingFlow(input);
}

const summarizeMeetingPrompt = ai.definePrompt({
  name: 'summarizeMeetingPrompt',
  input: {schema: SummarizeMeetingInputSchema},
  output: {schema: SummarizeMeetingOutputSchema},
  prompt: `Summarize the following meeting transcript.
The desired length for the summary is '{{{summaryLength}}}'.
The desired structural focus for the summary is '{{{templateFocus}}}'.

If '{{{templateFocus}}}' is 'standard':
Please provide a balanced overview. Structure your summary with the following sections if applicable:
- Key Discussion Points: (Briefly list the main topics discussed)
- Decisions Made: (List key decisions reached)
- Action Items Overview: (Briefly mention if action items were identified; details will be in a separate list)
- Overall Outcome & Next Steps: (Conclude the meeting's result and any immediate follow-ups)

If '{{{templateFocus}}}' is 'decisionFocused':
Please heavily emphasize decisions made. Structure your summary with the following sections if applicable:
- Key Decisions Made: (Detail each decision, who might be responsible if mentioned, and any deadlines if specified)
- Supporting Discussion for Decisions: (Briefly mention the context or arguments that led to these decisions)
- Action Items Related to Decisions: (Highlight action items directly resulting from these decisions)
- Unresolved Issues for Next Meeting: (List any points related to the decisions that require further discussion)

Length guidance:
- If 'short', provide a 1-2 sentence overview, keeping the chosen structural focus in mind.
- If 'standard', provide a concise paragraph, adhering to the chosen structural focus.
- If 'detailed', provide a more comprehensive paragraph, fully developing the sections of the chosen structural focus.

Transcript:
{{{transcript}}}

Summary:`,
});

const summarizeMeetingFlow = ai.defineFlow(
  {
    name: 'summarizeMeetingFlow',
    inputSchema: SummarizeMeetingInputSchema,
    outputSchema: SummarizeMeetingOutputSchema,
  },
  async input => {
    const {output} = await summarizeMeetingPrompt(input);
    return output || { summary: "Failed to generate summary."};
  }
);
