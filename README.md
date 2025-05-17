# Firebase Studio - NotiQ Lite

This is a NextJS starter in Firebase Studio, enhanced to create NotiQ Lite - an AI-powered meeting assistant.

## Features

- Upload meeting audio (e.g., .mp3, .wav, .m4a).
- AI-powered transcription of the audio.
- AI-generated summary of the meeting transcript.
- "Ask NotiQ": Chat with an AI about the meeting content.
- Export transcript and summary.
- User authentication via Firebase (Sign in with Google).

## Getting Started

1.  **Clone the repository (if applicable) or ensure you have the project files.**
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```
3.  **Set up Firebase:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).
    *   In your Firebase project, go to **Project settings** > **General**.
    *   Under "Your apps", click on the Web icon (`</>`) to add a web app (if you haven't already).
    *   Give your app a nickname and register it.
    *   Firebase will provide you with a `firebaseConfig` object. Copy these credentials.
    *   Create a `.env` file in the root of your project (or rename/populate the existing one if it came with placeholders).
    *   Add your Firebase credentials to the `.env` file, like so:
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN_HERE
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID_HERE
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET_HERE
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID_HERE
        NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID_HERE
        # NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID_HERE (optional)
        ```
    *   In your Firebase project, go to **Authentication** (under Build).
    *   Click on "Get started".
    *   Under "Sign-in method", enable **Google** as a sign-in provider. You'll need to provide a project support email.

4.  **Set up Genkit AI (Google AI):**
    *   Ensure you have a Google Cloud project with the Vertex AI API enabled.
    *   Set up authentication for Genkit, typically by running `gcloud auth application-default login`.
    *   Alternatively, you can set the `GOOGLE_API_KEY` environment variable if you are using a Google AI Studio API key for Gemini models. Add it to your `.env` file:
        ```env
        GOOGLE_API_KEY=YOUR_GOOGLE_AI_STUDIO_API_KEY
        ```

5.  **Run the development server:**
    *   For the Next.js app:
        ```bash
        npm run dev
        ```
    *   For Genkit (in a separate terminal):
        ```bash
        npm run genkit:dev
        ```
    Open [http://localhost:9002](http://localhost:9002) (or your configured port) with your browser to see the result.
    The Genkit developer UI will be available at [http://localhost:4000](http://localhost:4000).


## Project Structure

-   `src/app/`: Main Next.js App Router pages and layouts.
-   `src/components/`: React components, including UI elements from ShadCN.
-   `src/ai/`: Genkit related files.
    -   `src/ai/flows/`: Genkit flows for AI functionalities (transcription, summarization, Q&A).
    -   `src/ai/genkit.ts`: Genkit initialization.
    -   `src/ai/dev.ts`: Genkit development server entry point.
-   `src/lib/`: Utility functions, including Firebase initialization (`firebase.ts`).
-   `src/contexts/`: React context providers (e.g., `auth-context.tsx`).
-   `public/`: Static assets.

To get started editing the app, take a look at `src/app/page.tsx`.
