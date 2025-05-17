
'use server';
/**
 * @fileOverview A Genkit flow for refining a meeting summary based on user instructions.
 *
 * - refineSummary - A function that takes a current summary and an instruction, and returns a refined summary.
 * - RefineSummaryInput - The input type for the refineSummary function.
 * - RefineSummaryOutput - The return type for the refineSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineSummaryInputSchema = z.object({
  currentSummary: z
    .string()
    .describe('The current meeting summary that needs to be refined.'),
  refinementInstruction: z
    .string()
    .describe('The user_s instruction on how to refine the summary (e.g., "make it shorter", "focus on action items", "expand on the budget discussion").'),
});
export type RefineSummaryInput = z.infer<typeof RefineSummaryInputSchema>;

const RefineSummaryOutputSchema = z.object({
  refinedSummary: z
    .string()
    .describe('The refined meeting summary based on the user_s instruction.'),
});
export type RefineSummaryOutput = z.infer<typeof RefineSummaryOutputSchema>;

export async function refineSummary(input: RefineSummaryInput): Promise<RefineSummaryOutput> {
  if (!input.currentSummary || input.currentSummary.trim() === "") {
    return { refinedSummary: "Cannot refine an empty summary." };
  }
  if (!input.refinementInstruction || input.refinementInstruction.trim() === "") {
    return { refinedSummary: input.currentSummary }; // No instruction, return original
  }
  return refineSummaryFlow(input);
}

const refineSummaryPrompt = ai.definePrompt({
  name: 'refineSummaryPrompt',
  input: {schema: RefineSummaryInputSchema},
  output: {schema: RefineSummaryOutputSchema},
  prompt: `You are an AI assistant helping to revise and refine meeting summaries.
You will be given a current meeting summary and an instruction from the user on how to change it.
Your goal is to follow the instruction and provide a new, refined summary.

Current Summary:
{{{currentSummary}}}

User's Instruction for Refinement:
{{{refinementInstruction}}}

Based on the instruction, provide the refined summary.
Refined Summary:`,
});

const refineSummaryFlow = ai.defineFlow(
  {
    name: 'refineSummaryFlow',
    inputSchema: RefineSummaryInputSchema,
    outputSchema: RefineSummaryOutputSchema,
  },
  async input => {
    const {output} = await refineSummaryPrompt(input);
    return output || { refinedSummary: "Failed to refine summary." };
  }
);
