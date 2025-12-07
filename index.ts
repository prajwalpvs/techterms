/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI, Modality} from '@google/genai';
import {marked} from 'marked';

// TODO: Replace 'YOUR_API_KEY_HERE' with your actual API key, ideally injected securely at build time.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY as string });

const userInput = document.querySelector('#input') as HTMLTextAreaElement;
const modelOutput = document.querySelector('#output') as HTMLDivElement;
const slideshow = document.querySelector('#slideshow') as HTMLDivElement;
const error = document.querySelector('#error') as HTMLDivElement;

const additionalInstructions = `
Use a fun story about lots of tiny dogs as a metaphor.
Keep sentences short but conversational, casual, and engaging.
Generate a cute, minimal illustration for each sentence with black ink on white background.
No commentary, just begin your explanation.
Keep going until you're done.`;

async function addSlide(text: string, image: HTMLImageElement) {
  const slide = document.createElement('div');
  slide.className = 'slide';
  const caption = document.createElement('div') as HTMLDivElement;
  caption.innerHTML = await marked.parse(text);
  slide.append(image);
  slide.append(caption);
  slideshow.append(slide);
}

function parseError(error: string) {
  const regex = /{"error":(.*)}/gm;
  const m = regex.exec(error);
  if (m && m[1]) {
    try {
      const e = m[1];
      const err = JSON.parse(e);
      return err.message;
    } catch (e) {
      // Fall through to return original error if parsing fails
    }
  }
  return error;
}

async function generate(message: string) {
  userInput.disabled = true;

  modelOutput.innerHTML = '';
  slideshow.innerHTML = '';
  error.innerHTML = '';
  error.toggleAttribute('hidden', true);

  try {
    const userTurn = document.createElement('div') as HTMLDivElement;
    userTurn.innerHTML = await marked.parse(message);
    userTurn.className = 'user-turn';
    modelOutput.append(userTurn);
    userInput.value = '';

    const result = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash-image-preview',
      contents: message + additionalInstructions,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    let text = '';
    let img: HTMLImageElement | null = null;

    for await (const chunk of result) {
      if (chunk.candidates) {
        for (const candidate of chunk.candidates) {
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
            if (part.text) {
              text += part.text;
            } else {
              try {
                const data = part.inlineData;
                if (data) {
                  img = document.createElement('img');
                  img.src = `data:image/png;base64,` + data.data;
                } else {
                  console.log('no data', chunk);
                }
              } catch (e) {
                console.log('no data', chunk);
              }
            }
            if (text && img) {
              await addSlide(text, img);
              slideshow.removeAttribute('hidden');
              text = '';
              img = null;
            }
          }
        }
      }
    }
    if (img) {
      await addSlide(text, img);
      slideshow.removeAttribute('hidden');
      text = '';
    }
  } // <-- Close the for await...of loop
  } catch (e: unknown) {
    const errorString = e instanceof Error ? e.toString() : String(e);
    const msg = parseError(errorString);
    error.innerHTML = `Something went wrong: ${msg}`;
    error.removeAttribute('hidden');
  }
  userInput.disabled = false;
  userInput.focus();
}

// FIX: Removed API key check to comply with coding guidelines.
// The application should assume the API key is correctly configured in the environment.
userInput.addEventListener('keydown', async (e: KeyboardEvent) => {
  if (e.code === 'Enter') {
    e.preventDefault();
    const message = userInput.value;
    if (message) {
      await generate(message);
    }
  }
});

const examples = document.querySelectorAll('#examples li');
examples.forEach((li) =>
  li.addEventListener('click', async () => {
    if (li.textContent) {
      await generate(li.textContent);
    }
  }),
);
