// src/ai/flows/generate-talking-points.ts
'use server';

/**
 * @fileOverview Generates talking points for sales calls based on past interactions.
 *
 * - generateTalkingPoints - A function that generates talking points.
 * - GenerateTalkingPointsInput - The input type for the generateTalkingPoints function.
 * - GenerateTalkingPointsOutput - The return type for the generateTalkingPoints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTalkingPointsInputSchema = z.object({
  pastInteractions: z
    .string()
    .describe(
      'A detailed summary of past interactions with the client, including notes from previous calls, emails, and meetings.'
    ),
  opportunityDetails: z
    .string()
    .describe('Details about the sales opportunity, including the current stage, key objectives, and any specific challenges.'),
  clientProfile: z.string().describe('A profile of the client, including their industry, company size, and key decision-makers.'),
});

export type GenerateTalkingPointsInput = z.infer<typeof GenerateTalkingPointsInputSchema>;

const GenerateTalkingPointsOutputSchema = z.object({
  talkingPoints: z
    .array(z.string())
    .describe('A list of suggested talking points for the upcoming sales call.'),
  followUpActions: z
    .array(z.string())
    .describe('Suggested follow-up actions after the call, such as sending a proposal or scheduling a demo.'),
});

export type GenerateTalkingPointsOutput = z.infer<typeof GenerateTalkingPointsOutputSchema>;

export async function generateTalkingPoints(input: GenerateTalkingPointsInput): Promise<GenerateTalkingPointsOutput> {
  return generateTalkingPointsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTalkingPointsPrompt',
  input: {schema: GenerateTalkingPointsInputSchema},
  output: {schema: GenerateTalkingPointsOutputSchema},
  prompt: `You are an AI-powered sales assistant helping sales representatives prepare for upcoming calls.

  Analyze the following information and suggest talking points and follow-up actions for the call.

  Past Interactions: {{{pastInteractions}}}
  Opportunity Details: {{{opportunityDetails}}}
  Client Profile: {{{clientProfile}}}

  Talking Points:
  -Focus on key topics that matter to the client.
  -Address any concerns or questions raised in past interactions.
  -Highlight the benefits of our solution for the client's specific needs.

  Follow-Up Actions:
  -Suggest concrete steps to move the sales opportunity forward.
  -Tailor the actions to the client's preferences and timeline.
  -Ensure the actions are feasible and align with the overall sales strategy.`,
});

const generateTalkingPointsFlow = ai.defineFlow(
  {
    name: 'generateTalkingPointsFlow',
    inputSchema: GenerateTalkingPointsInputSchema,
    outputSchema: GenerateTalkingPointsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
