# Giọng Đọc Việt | Private Vietnamese TTS Web App

A private, secure, and visually stunning web application built on **Next.js** to convert Vietnamese text to speech using the **Google Cloud Text-to-Speech API** (with high-quality Neural2/WaveNet voices).

---

## Features

- **Access Protection:** Passcode protection layer checked on the server-side to prevent unauthorized usage.
- **Modern UI/UX:** Sleek glassmorphism theme, premium gradients, micro-animations, loading indicators, and fully responsive design.
- **Voice Selections:**
  - **Neural2 (Premium):** Highly natural voice synthesis models (Male & Female).
  - **WaveNet:** Premium AI-generated voices (Multiple male/female speaking styles).
  - **Standard:** Lightweight traditional text-to-speech models.
- **Input Controls:** Styled textarea with character validation and count indicators (up to 4000 characters).
- **Audio Console:** Embedded custom media player with speed control and a **Direct MP3 Download** link.

---

## Setup Instructions

### 1. Google Cloud Platform Setup

1. **Create or select a Google Cloud Project** in the [Google Cloud Console](https://console.cloud.google.com/).
2. **Enable Billing** for your project.
3. **Enable the API:** Go to the API Library, search for **Cloud Text-to-Speech API**, and enable it.
4. **Create a Service Account:**
   - Navigate to **IAM & Admin > Service Accounts**.
   - Click **Create Service Account**, name it (e.g., `vietnamese-tts`), and click create.
   - You do not need to assign project roles, as API access is permitted by default with valid project credentials.
5. **Generate a JSON Private Key:**
   - In the Service Accounts list, click on the newly created Service Account.
   - Go to the **Keys** tab, click **Add Key > Create New Key**, select **JSON**, and click Create.
   - A JSON file containing your credentials will download. **Keep this file secure!**

---

### 2. Project Configuration

1. In the project directory, copy the environment template file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and configure your settings:
   - `APP_ACCESS_PASSCODE`: Choose a secure passcode (e.g., `admin123`). This will block access to the app UI.
   - `GOOGLE_PROJECT_ID`: Copy `"project_id"` from your service account JSON file.
   - `GOOGLE_CLIENT_EMAIL`: Copy `"client_email"` from your service account JSON file.
   - `GOOGLE_PRIVATE_KEY`: Copy the **entire** value of `"private_key"` from your JSON file. It should begin with `-----BEGIN PRIVATE KEY-----\n` and end with `\n-----END PRIVATE KEY-----\n`. Keep the quotation marks around the string.

---

### 3. Local Installation & Launch

To install dependencies and start the app locally:

1. **Install packages:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.
4. Enter your custom `APP_ACCESS_PASSCODE` to unlock the app and start synthesizing text!

---

## Tech Stack

- **Framework:** Next.js (App Router, Client & Server API Routes)
- **Styling:** CSS Modules / Vanilla CSS (Modern dark glassmorphic styling)
- **Core SDK:** `@google-cloud/text-to-speech` for secure server-side synthesis
- **Fonts:** Google Fonts (Outfit & Plus Jakarta Sans) optimized for Vietnamese

---

## Online Deployment (100% Free Hobby Tier on Vercel)

For private, low-traffic usage, the best option is to deploy to **Vercel** under their **Hobby Plan** (which is free and natively optimizes Next.js apps).

### Step 1: Push Code to a Private GitHub Repository
1. Initialize a Git repository locally if you haven't already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit with .gitignore"
   ```
2. Go to GitHub and create a new **Private** repository (e.g., `text2audio-vietnamese`).
3. Add the GitHub remote and push your code:
   ```bash
   git remote add origin https://github.com/your-username/text2audio-vietnamese.git
   git branch -M main
   git push -u origin main
   ```
   *(Note: The newly added `.gitignore` will prevent committing local secret credentials from `.env.local` to GitHub.)*

### Step 2: Deploy to Vercel
1. Log in to your [Vercel Account](https://vercel.com).
2. Click **Add New > Project**.
3. Import your private repository `text2audio-vietnamese`.
4. In the **Environment Variables** dropdown config section, add the following variables:
   - `APP_ACCESS_PASSCODE`: The passcode you will use to unlock the app UI (e.g., `13072001`).
   - `GOOGLE_PROJECT_ID`: The GCP project ID (copy `"project_id"` from your service account JSON).
   - `GOOGLE_CLIENT_EMAIL`: The GCP client email (copy `"client_email"` from your service account JSON).
   - `GOOGLE_PRIVATE_KEY`: The GCP private key (copy the **entire** value of `"private_key"` from your service account JSON, including header, footer, and `\n` characters).
5. Click **Deploy**. Vercel will build your application and provide a live `.vercel.app` domain.

---

## Troubleshooting: Cloud Text-to-Speech API Disabled

If you see a `PERMISSION_DENIED` error like:
`Error: 7 PERMISSION_DENIED: Cloud Text-to-Speech API has not been used in project...`

It means the Text-to-Speech API needs to be enabled on your GCP Console.
1. Visit the [Google Cloud Text-to-Speech API Console](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/overview).
2. Select your project (e.g., `text2speech-499501`) in the top project picker.
3. Click the **Enable** button.
4. Wait 2-3 minutes for Google's systems to propagate, then reload your deployed Vercel app or local instance and submit your text again.

