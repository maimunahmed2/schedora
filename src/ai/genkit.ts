import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const options: any = {
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
};

export const ai = genkit(options);
