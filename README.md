# 🚀 UniDown — Universal Media & File Downloader

UniDown is a modern, lightweight, universal media and file downloader designed to extract videos, music, images, and documents from **any website**, social platform, or direct stream URL.

Built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**, UniDown is engineered specifically to be **100% serverless and deployable to Vercel in 1 click** on both Free Hobby and Pro tiers.

---

## ✨ Features

- **🌐 Download from ANY Site**:
  - **Universal Web Inspector**: Automatically analyzes any webpage DOM using Cheerio to find embedded HTML5 `<video>`, `<audio>`, OpenGraph media tags (`og:video`, `og:image`), structured JSON-LD schemas (`VideoObject`, `AudioObject`), high-resolution images, and downloadable document links (`.pdf`, `.zip`, `.mp4`, `.mp3`, etc.).
- **⚡ Social & Streaming Platforms**:
  - Full support for **YouTube**, **TikTok** (watermark-free), **Instagram** (Reels & Carousels), **Twitter / X**, **Reddit** (videos with audio), **SoundCloud**, **Vimeo**, **Pinterest**, **Dailymotion**, and **Twitch Clips**.
- **🛡️ Built-in CORS Bypass Streaming Proxy (`/api/download`)**:
  - Many websites restrict direct downloads with cross-origin headers (CORS) or require custom `Referer` headers. UniDown's streaming route safely proxies streams with `Content-Disposition: attachment; filename="..."`, allowing seamless 1-click downloads with correct filenames and HTTP range resumption.
- **🎛️ Multi-Resolution & Audio Extraction**:
  - Choose between available resolutions (1080p, 720p, 480p, 360p) or extract audio directly (MP3, WAV, Opus, OGG).
- **📂 Multi-Item Page Gallery & Picker**:
  - If a webpage contains multiple videos or images, or an Instagram post is a carousel, UniDown displays a rich gallery where you can download items individually or filter by type (Video, Audio, Image, File).
- **📜 Local Download History**:
  - Keeps a history of recent downloads in your browser's `localStorage` for instant re-downloading.
- **⚙️ Custom Backend & Instance Configuration**:
  - Includes high-availability community fallback rotation out-of-the-box, with the ability to plug in your own private self-hosted Cobalt engine or proxy URL.
- **🎨 Modern Glassmorphism UI**:
  - Responsive dark/light theme, real-time platform detector chip, clipboard auto-paste, and quick sample links.

---

## 🚀 How to Host on Vercel

UniDown is designed from the ground up for Vercel Serverless Functions:
- **No heavy native binaries or ffmpeg packages** that exceed Vercel's 50MB function zip limit or Hobby execution timeouts.
- Uses native Node.js HTTP streaming without filling ephemeral disk storage.
- Auto-configured `vercel.json` with Next.js presets.

### Method 1: Deploy with Git & Vercel Dashboard (Recommended)

1. **Initialize Git & Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: UniDown"
   git remote add origin https://github.com/YOUR_USERNAME/unidown.git
   git branch -M main
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Import your `unidown` repository.
   - Framework Preset: **Next.js** (auto-detected).
   - Click **Deploy**!
   - Your universal downloader is live on your custom `.vercel.app` domain with free SSL.

### Method 2: Deploy with Vercel CLI (1 Command)

Open your terminal in the project directory and run:
```bash
npx vercel
```
Follow the 3 CLI prompts (Set up and deploy? **Yes**). Your app will build and deploy to Vercel in seconds.

To deploy to production:
```bash
npx vercel --prod
```

---

## ⚙️ Environment Variables (Optional)

In your Vercel Project Settings > **Environment Variables** (or `.env.local` for local development):

| Variable | Description | Default |
| :--- | :--- | :--- |
| `COBALT_API_URL` | Custom self-hosted or public Cobalt engine endpoint | Community high-availability fallbacks |
| `NEXT_PUBLIC_APP_NAME` | Custom application title displayed in header | `"UniDown"` |

*(If no environment variables are provided, UniDown automatically uses reliable community fallback endpoints).*

---

## 💻 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── extract/route.ts      # Core extraction API route
│   │   └── download/route.ts     # CORS-free HTTP streaming proxy
│   ├── globals.css               # Tailwind & glassmorphism theme
│   ├── layout.tsx                # App root layout & SEO metadata
│   └── page.tsx                  # Main interactive UI
├── components/
│   ├── Navbar.tsx                # Header with settings, history, and theme toggle
│   ├── UrlInput.tsx              # Smart search bar with auto-detect & samples
│   ├── MediaResult.tsx           # Media card preview, quality picker, & gallery
│   ├── DownloadHistory.tsx       # Local history drawer
│   ├── SettingsModal.tsx         # Backend instance & format settings
│   ├── SupportedSitesModal.tsx   # Comprehensive platform directory
│   └── VercelDeployBanner.tsx    # Vercel deployment guide widget
└── lib/
    ├── types.ts                  # TypeScript interfaces
    ├── utils.ts                  # Formatters, domain helpers, platform detector
    └── extractors/
        ├── direct.ts             # Direct media & file link inspector
        ├── cobalt.ts             # Social media engine with fallback rotation
        ├── reddit.ts             # Native Reddit parser
        ├── twitter.ts            # Native Twitter/X mirror extractor
        ├── web-scraper.ts        # Universal HTML5 & OpenGraph scraper
        └── index.ts              # Master extraction orchestrator
```

---

## 📄 License

MIT License. Built for open-source personal media backup and archival.
