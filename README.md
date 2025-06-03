# LogCents - Expense Tracker

A modern expense tracking application built with Next.js and Firebase. Track your expenses effortlessly using AI-powered receipt scanning and voice recording. The app automatically categorizes your transactions, provides detailed analytics, and helps you manage your finances effectively.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start Firebase emulators (for local development)
npm run firebase

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## ✨ Features

- 📱 Modern, responsive UI with dark/light mode
- 🔐 Secure authentication with Firebase
- 💾 Real-time data sync with Firestore
- 📊 Interactive expense tracking and analytics
- 📈 Data visualization and insights
- 🔄 Real-time updates
- 🎨 Beautiful UI with shadcn/ui
- 🤖 AI-powered receipt scanning and analysis
- 🎤 Voice recording for expense entry
- 📝 Automatic transaction categorization

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Auth, Firestore)
- **State**: Zustand
- **Forms**: Zod
- **Dates**: date-fns
- **UI**: Sonner (notifications), Cloudinary (images)
- **Analytics**: PostHog
- **AI**: Google Gemini AI (via Vercel AI SDK)

## 🔧 Environment Setup

Create a `.env.local` file with your credentials for:
- Firebase (Client & Admin)
- Cloudinary
- PostHog Analytics
- Google AI (GOOGLE_GENERATIVE_AI_API_KEY)

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run firebase` | Start Firebase emulators |
| `npm run seed` | Seed database (dev only) |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request