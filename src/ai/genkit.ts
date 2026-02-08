import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const options: any = {
  plugins: [],
};

if (process.env.GEMINI_API_KEY) {
  options.plugins.push(googleAI());
  options.model = 'googleai/gemini-2.5-flash';
} else {
  // In a production environment, you would likely want to throw an error here.
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'GEMINI_API_KEY is not set. AI features will be disabled.'
    );
  }
}

export const ai = genkit(options);
