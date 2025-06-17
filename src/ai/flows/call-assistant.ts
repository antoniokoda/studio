'use server';

/**
 * @fileOverview Provides AI-generated suggestions for follow-up actions after a call.
 *
 * - suggestFollowUpActions - A function that generates follow-up action suggestions.
 * - SuggestFollowUpActionsInput - The input type for the suggestFollowUpActions function.
 * - SuggestFollowUpActionsOutput - The return type for the suggestFollowUpActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFollowUpActionsInputSchema = z.object({
  callSummary: z.string().describe('A summary of the call.'),
  pastInteractions: z
    .string()
    .optional()
    .describe('A summary of past interactions with the client.'),
  notes: z.string().optional().describe('Any additional notes about the client.'),
});
export type SuggestFollowUpActionsInput = z.infer<typeof SuggestFollowUpActionsInputSchema>;

const SuggestFollowUpActionsOutputSchema = z.object({
  followUpActions: z.array(z.string()).describe('A list of suggested follow-up actions.'),
});
export type SuggestFollowUpActionsOutput = z.infer<typeof SuggestFollowUpActionsOutputSchema>;

export async function suggestFollowUpActions(input: SuggestFollowUpActionsInput): Promise<SuggestFollowUpActionsOutput> {
  return suggestFollowUpActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFollowUpActionsPrompt',
  input: {schema: SuggestFollowUpActionsInputSchema},
  output: {schema: SuggestFollowUpActionsOutputSchema},
  prompt: `You are a sales assistant who suggests follow-up actions after a call.

  Based on the call summary, past interactions, and notes, suggest a list of follow-up actions.

  Call Summary: {{{callSummary}}}
  Past Interactions: {{{pastInteractions}}}
  Notes: {{{notes}}}

  Follow-up Actions:`,
});

const suggestFollowUpActionsFlow = ai.defineFlow(
  {
    name: 'suggestFollowUpActionsFlow',
    inputSchema: SuggestFollowUpActionsInputSchema,
    outputSchema: SuggestFollowUpActionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
