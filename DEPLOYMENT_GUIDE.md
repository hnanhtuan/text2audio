# Deployment Guide: Next.js Text-to-Speech on Vercel (Free Hobby Tier)

This guide provides step-by-step instructions on how to deploy your Vietnamese Text-to-Speech application to Vercel for free, keeping it secure and private.

---

## Prerequisites

1. **A GitHub Account**: Register at [github.com](https://github.com/) if you don't have one.
2. **A Vercel Account**: Register at [vercel.com](https://vercel.com/) (choose the **Hobby** plan which is free).
3. **Git** installed on your local computer.
4. **Google Cloud Service Account JSON Key** (the one you used to configure your local `.env.local`).

---

## Step 1: Initialize Git and Verify `.gitignore`

First, make sure we only push code and no secrets. We created a `.gitignore` file to ensure `.env.local` is never uploaded to GitHub.

1. Open your terminal in the project directory (`/home/anhxtuan/Works/Projects/text2audio`).
2. Initialize Git and commit the files:
   ```bash
   # Initialize git repository
   git init

   # Check which files will be added (make sure `.env.local` is NOT listed)
   git status

   # Stage all files
   git add .

   # Commit the files
   git commit -m "Initial commit with security configuration"
   ```

---

## Step 2: Push to a Private GitHub Repository

1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g., `text2speech-vietnamese`).
3. **IMPORTANT**: Select **Private** to make sure only you can see the source code.
4. Leave "Add a README file", "Add .gitignore", and "Choose a license" unchecked, then click **Create repository**.
5. Copy the commands under **"…or push an existing repository from the command line"** and run them in your terminal:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/text2speech-vietnamese.git
   git push -u origin main
   ```
   *(Replace `YOUR_GITHUB_USERNAME` and the repository name with your actual details).*

---

## Step 3: Connect GitHub to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click the **Add New...** button in the top right, then select **Project**.
3. If this is your first time, Vercel will prompt you to connect your Git provider. Select **GitHub** and grant Vercel access to your private repository (`text2speech-vietnamese`).
4. Once connected, locate your `text2speech-vietnamese` repository in the list and click **Import**.

---

## Step 4: Configure Environment Variables

This is the most critical step to ensure Next.js can connect to the Google Cloud Text-to-Speech API.

1. Under **Configure Project**, expand the **Environment Variables** section.
2. Add the following key-value pairs (match the keys exactly, copying values from your local `.env.local` file):

| Key | Value Source / Example | Note |
| :--- | :--- | :--- |
| `APP_ACCESS_PASSCODE` | `13072001` | The secret passcode to unlock the website. |
| `GOOGLE_PROJECT_ID` | `text2speech-499501` | Your GCP project ID. |
| `GOOGLE_CLIENT_EMAIL` | `vietnamese-tts@text2speech-499501.iam.gserviceaccount.com` | Your GCP service account email. |
| `GOOGLE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgk...` | Paste the **entire** private key string. |

### How to format `GOOGLE_PRIVATE_KEY` in Vercel:
- Open your local `.env.local` file.
- Locate the `GOOGLE_PRIVATE_KEY` line.
- Copy the **entire** value inside the quotes (beginning with `-----BEGIN PRIVATE KEY-----\n` and ending with `\n-----END PRIVATE KEY-----\n`).
- Paste it into the value field for `GOOGLE_PRIVATE_KEY` in the Vercel dashboard. Vercel allows both raw newlines and single-line configurations with `\n` characters because our server route automatically parses `\n` correctly!

---

## Step 5: Deploy

1. Once the environment variables are set up, click **Deploy**.
2. Vercel will start building the project (installing dependencies, building the Next.js production build).
3. In 1–2 minutes, you will see a success animation and a **"Congratulations!"** screen with a preview of your live site.
4. Click on the preview screenshot or the deployment URL (e.g., `text2speech-vietnamese.vercel.app`) to open your live web application.

---

## Step 6: Verify Deployment

1. Navigate to your new `.vercel.app` URL.
2. You will be greeted by the passcode portal. Enter your `APP_ACCESS_PASSCODE` (e.g., `13072001`) and press **Xác nhận**.
3. Type some Vietnamese text (e.g., *"Xin chào, đây là thử nghiệm giọng đọc Việt"*), select a voice, and click **Chuyển Thành Giọng Nói**.
4. The synthesized audio should play back, and you can download the MP3 file!

---

## Future Updates

Whenever you make updates to the codebase:
1. Commit the changes:
   ```bash
   git add .
   git commit -m "Describe your changes"
   ```
2. Push them to GitHub:
   ```bash
   git push
   ```
3. Vercel will automatically detect the new commit on the `main` branch, rebuild, and redeploy your website in the background without any manual action!
