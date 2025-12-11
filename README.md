# Explain with Tiny Dogs 🐕

An interactive web app that uses **Google's Gemini API** to explain complex topics with fun, illustrated slideshows featuring tiny dogs as metaphors.

## Features

- 🤖 **AI-powered explanations** using Gemini 2.5 Flash
- 🎨 **Auto-generated illustrations** for each explanation step
- 🐕 **Dog-themed metaphors** to make learning fun and memorable
- ⚡ **Fast streaming responses** with real-time updates
- 🔑 **Secure API key management** via environment variables
- 📱 **Responsive design** built with modern web technologies

## Tech Stack

- **Frontend Framework**: TypeScript + HTML5/CSS
- **Build Tool**: Vite
- **API**: Google Generative AI (Gemini)
- **Markdown Rendering**: Marked.js
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js (v22+)
- npm
- Google Gemini API key ([get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/prajwalpvs/techterms.git
   cd techterms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```
   VITE_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000/`

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

1. Open the app in your browser
2. Enter a topic you'd like to learn about (e.g., "How does photosynthesis work?")
3. Press Enter or click an example
4. Watch as Gemini generates a fun, illustrated slideshow explaining the concept using tiny dog metaphors
5. Each slide contains a clear explanation paired with a cute illustration

## Project Structure

```
.
├── index.html          # Main HTML entry point
├── index.ts            # Main TypeScript file with app logic
├── index.css           # Styles
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
├── env.d.ts            # Environment variable type definitions
├── metadata.json       # Project metadata
└── .gitignore          # Git ignore rules
```

## Key Files

- **index.ts** - Core app logic including:
  - Gemini API integration
  - Streaming response handling
  - Slideshow generation
  - Error handling with retry logic
  - Event listeners for user interactions

- **env.d.ts** - TypeScript declarations for `import.meta.env.VITE_API_KEY`

- **.env** - Local environment configuration (not committed to repo)

## API Integration

The app uses the **Gemini 2.5 Flash** model with multimodal capabilities:

```typescript
ai.models.generateContentStream({
  model: 'gemini-2.5-flash-image-preview',
  contents: userMessage + additionalInstructions,
  config: {
    responseModalities: [Modality.TEXT, Modality.IMAGE],
  },
})
```

### Features:
- Streams both text explanations and generated illustrations
- Uses dog-themed metaphors for engaging learning
- Minimal black ink on white background illustrations
- Short, conversational sentences for clarity

## Error Handling

The app includes automatic retry logic for quota-exceeded errors (429):
- Respects server-provided retry delays
- Exponential backoff with jitter
- User-friendly error messages

## Security

- ⚠️ **Never commit `.env` file** - it contains your API key
- `.env` is listed in `.gitignore` for protection
- API keys should be rotated if accidentally exposed

## Troubleshooting

### "Quota exceeded" error
- Check your Gemini API usage at https://ai.dev/usage
- Upgrade your API plan or wait for quota reset
- The app will automatically retry with backoff

### MIME type errors
- Ensure Vite dev server is running (`npm run dev`)
- Don't open `index.html` directly via file://
- Clear browser cache (Ctrl+Shift+R)

### "Property 'env' does not exist on type 'ImportMeta'"
- Ensure `env.d.ts` exists in the project root
- Restart TypeScript server in your editor

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest improvements
- Add new features

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Marked.js Documentation](https://marked.js.org/)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages in browser console
3. Verify your API key and quota at https://ai.dev/usage
4. Open an issue on GitHub with details

---

Made with 🐕 and ❤️ by Prajwal Perugu
