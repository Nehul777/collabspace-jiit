# CollabSpace JIIT 🚀

🌐 **Live Demo:** [https://collabspace-jiit.vercel.app](https://collabspace-jiit.vercel.app)

CollabSpace JIIT is a modern, high-performance web platform designed specifically for students at Jaypee Institute of Information Technology (JIIT). It acts as a collaborative hub where students can create profiles, pitch project ideas, and recruit teammates based on specific skills (e.g., C++, Next.js, Python) and hardware capabilities (e.g., RTX GPUs, MacBooks). 

Built with a stunning "Cyber-Discord" neon aesthetic, the platform features glassmorphism UI, real-time threaded chat, and robust security.

## ✨ Features

- **Exclusive Domain Access**: Strictly restricted to `@mail.jiit.ac.in` Google accounts to ensure a safe, student-only environment.
- **Dynamic Profiles**: Students can showcase their batches, enrollment numbers, technical skills, preferred roles, and available hardware.
- **Project Pitch Board**: A Kanban-style dashboard where users can post project ideas and specify exactly how many developers, designers, or hardware resources they need.
- **Smart Matchmaking**: Easily filter and find students whose skills and hardware match your project's exact requirements.
- **Real-Time Team Chat**: Integrated real-time messaging using Supabase WebSockets. Features optimistic UI updates and instant synchronization for seamless team communication.
- **Race-Condition Safe**: Advanced PostgreSQL row-level locking ensures that project roles cannot be overbooked, even if multiple students click "Join" at the exact same millisecond.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS v4
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Real-time**: Supabase Realtime Subscriptions
- **Validation**: Zod (Environment & Schema validation)
- **Deployment**: Optimized for Vercel Serverless Architecture

## 🚀 Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nehul777/collabspace-jiit.git
   cd collabspace-jiit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗺️ Next Steps & Roadmap

If you want to contribute or continue building the platform, here are some great next steps:

- [ ] **Email Notifications**: Integrate Resend or SendGrid via Supabase Edge Functions to send an email when a student is accepted into a project or receives a chat mention.
- [ ] **AI Project Recommendations**: Use OpenAI/Gemini to analyze student profiles and auto-suggest projects they might be interested in.
- [ ] **Admin Dashboard**: Create an `/admin` route for college moderators to manage flagged pitches or ban inappropriate profiles.
- [ ] **File Sharing**: Expand the real-time chat to support sharing PDFs, images, and code snippets using Supabase Storage.
- [ ] **Dark/Light Mode Toggle**: While the Cyber-Discord dark mode is beautiful, adding a light mode toggle would improve accessibility.

## 🔒 Security

This project employs strict Row Level Security (RLS) in PostgreSQL. Users can only edit their own profiles and pitches. Environment variables are strictly validated at build-time to prevent production crashes.
