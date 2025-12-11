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
const shareContainer = document.querySelector('#share-container') as HTMLDivElement;
const shareBtn = document.querySelector('#share-btn') as HTMLButtonElement;
const shareStatus = document.querySelector('#share-status') as HTMLSpanElement;

let currentQuestion = '';
let currentResponse = '';

const additionalInstructions = `
Use a fun story about lots of tiny dogs as a metaphor.
Keep sentences short but conversational, casual, and engaging.
Generate a cute, minimal illustration for each sentence with black ink on white background.
No commentary, just begin your explanation.
Keep going until you're done.`;

function generateShareUrl(question: string, response: string): string {
  const encodedQuestion = encodeURIComponent(question);
  const encodedResponse = encodeURIComponent(response);
  return `${window.location.origin}${window.location.pathname}?q=${encodedQuestion}&r=${encodedResponse}`;
}

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for non-secure contexts
    return new Promise((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }
}

async function handleShare() {
  const shareUrl = generateShareUrl(currentQuestion, currentResponse);
  shareBtn.disabled = true;
  shareStatus.textContent = 'Copying...';

  try {
    // Try Web Share API first (for mobile)
    if (navigator.share) {
      await navigator.share({
        title: 'Explain with Tiny Dogs',
        text: `Check out this explanation: "${currentQuestion}"`,
        url: shareUrl,
      });
      shareStatus.textContent = 'Shared! 🎉';
    } else {
      // Fallback to clipboard
      await copyToClipboard(shareUrl);
      shareStatus.textContent = 'Link copied to clipboard! 📋';
    }

    setTimeout(() => {
      shareStatus.textContent = '';
      shareBtn.disabled = false;
    }, 3000);
  } catch (err) {
    console.error('Share failed:', err);
    shareStatus.textContent = 'Share failed';
    shareBtn.disabled = false;
  }
}

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
  currentQuestion = message;
  currentResponse = '';

  modelOutput.innerHTML = '';
  slideshow.innerHTML = '';
  error.innerHTML = '';
  error.toggleAttribute('hidden', true);
  shareContainer.toggleAttribute('hidden', true);

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
    let responseText = '';

    for await (const chunk of result) {
      if (chunk.candidates) {
        for (const candidate of chunk.candidates) {
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
            if (part.text) {
              text += part.text;
              responseText += part.text;
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

    currentResponse = responseText;
    if (currentResponse.length > 0) {
      shareContainer.removeAttribute('hidden');
    }
  } // <-- Close the for await...of loop
  } catch (e: unknown) {
    const errorString = e instanceof Error ? e.toString() : String(e);
    const msg = parseError(errorString);
    error.innerHTML = `Something went wrong: ${msg}`;
    error.removeAttribute('hidden');
    shareContainer.toggleAttribute('hidden', true);
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

// Share button event listener
if (shareBtn) {
  shareBtn.addEventListener('click', handleShare);
}

// Load from URL parameters if present
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const question = params.get('q');
  if (question) {
    userInput.value = decodeURIComponent(question);
  }
});
