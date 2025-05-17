
'use server';
/**
 * @fileOverview A Genkit flow for transcribing audio files, with speaker diarization and language specification.
 *
 * - transcribeAudio - A function that takes audio data and returns a transcript with speaker labels.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  languageCode: z.string().optional().describe('The BCP-47 language code for the audio (e.g., "en-US", "es-ES"). Defaults to "en-US" if not provided.'),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the audio, with speaker labels if discernible (e.g., Speaker 1: ..., Speaker 2: ...).'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  const effectiveInput = {
    ...input,
    languageCode: input.languageCode || 'en-US', // Default to English if not provided
  };
  return transcribeAudioFlow(effectiveInput);
}

const transcribeAudioPrompt = ai.definePrompt({
  name: 'transcribeAudioPrompt',
  input: {schema: TranscribeAudioInputSchema},
  output: {schema: TranscribeAudioOutputSchema},
  prompt: `Please transcribe the following audio accurately.
The primary language spoken in this audio is specified by the language code '{{{languageCode}}}'.
Identify and label different speakers in the transcript (e.g., "Speaker 1: ...", "Speaker 2: ...", or by name if discernible from the context).
Ensure the transcript is well-formatted and readable.
If the audio is unclear or silent, return an appropriate message or an empty transcript.
Audio: {{media url=audioDataUri}}`,
});

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async input => {
    // The wrapper function `transcribeAudio` already handles the default languageCode.
    const {output} = await transcribeAudioPrompt(input);
    return output || { transcript: "" }; // Ensure a valid output structure
  }
);

