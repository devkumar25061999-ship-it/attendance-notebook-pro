# 📋 Attendance Notebook Pro

> **Daily attendance, overtime tracking, salary slip generator, and integrated work diary notebook.**
> 100% Offline-First, Private, and Mobile-Optimized.

---

## ✨ Features

- 📅 **1-Tap Quick Attendance Marking**: Mark Work, Half Duty, Overtime, Holiday, Sick Leave, Vacation, or Emergency Leave with a single click.
- 🎨 **Vivid High-Contrast Calendar Matrix**: Distinct color schemes for Sundays, Saturdays, active dates, today indicator, and overtime badges.
- 💰 **Automated Salary & OT Engine**: Live calculation of daily basic wage, half-day wage, overtime compensation, and total net earnings.
- 📸 **Face Punch Biometric Photo**: Self-camera check-in photo capture stored directly in device local storage.
- 📝 **Integrated Work Diary & Khatabook**: Record daily notes, contractor payments, advance cash receipts, and site materials with categories and pin support.
- 📊 **HR Reports & Salary Slips**:
  - **Excel / CSV Download**: Export full month log with in/out timings, daily wage rates, and remarks.
  - **Printable A4 Salary Slip**: Clean, printer-friendly salary slip with authorization signature lines.
  - **Offline HTML Slip Download**: Save directly as PDF or HTML document.
- 🔒 **100% Offline & Private**: All data and photos remain stored safely in browser/app `localStorage`. Complete backup and restore via JSON.

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/attendance-notebook-pro.git
cd attendance-notebook-pro
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production
```bash
npm run build
```
The compiled production bundle will be generated in the `dist/` directory.

---

## 📱 How to Generate Android APK (.apk)

### Method 1: Using Capacitor (Standard Native Android Build)

1. Build the production web bundle:
   ```bash
   npm run build
   ```

2. Install Capacitor core and Android platform:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

3. Initialize Android project:
   ```bash
   npx cap add android
   npx cap copy
   ```

4. Open in Android Studio:
   ```bash
   npx cap open android
   ```

5. In **Android Studio**:
   - Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
   - The compiled `app-debug.apk` will be created in `android/app/build/outputs/apk/debug/`.
   - Transfer to your phone and install!

---

### Method 2: Using PWABuilder (1-Click, No Android Studio Needed)

1. Deploy the web app or push to GitHub and host via Vercel / Netlify / Cloud Run.
2. Go to **[PWABuilder.com](https://www.pwabuilder.com/)**.
3. Enter your web app URL.
4. Click **Package for Android** → Download your signed/unsigned `.apk` or `.aab` for Google Play Store.

---

## 📁 Project Structure

```
attendance-notebook-pro/
├── .github/workflows/       # GitHub Actions CI workflow
├── public/
│   ├── icon.svg             # Application vector icon
│   └── manifest.json        # Progressive Web App manifest
├── src/
│   ├── components/          # UI Modular Components
│   │   ├── CalendarGrid.tsx # Enhanced Calendar Matrix
│   │   ├── MonthNavigation.tsx
│   │   ├── StatsCards.tsx   # Work Days & OT earnings cards
│   │   ├── ToolSelector.tsx # 1-Tap Attendance Tools
│   │   ├── DayDetailsModal.tsx # Daily In/Out, Overtime, Note & Photo
│   │   ├── NotebookModal.tsx   # Work Diary & Site Notes
│   │   ├── ReportModal.tsx  # HR Reports, Excel CSV, and Printable Slip
│   │   ├── SettingsModal.tsx# Daily Wage, OT Rate, Backup/Restore
│   │   └── CameraModal.tsx  # Face Punch Camera
│   ├── data/
│   │   └── defaultData.ts   # Tools config, status badges & palette
│   ├── utils/
│   │   └── dateUtils.ts     # Calendar matrix computation
│   ├── types.ts             # TypeScript definitions
│   ├── App.tsx              # Main Application Container
│   ├── main.tsx             # React DOM root entry
│   └── index.css            # Tailwind CSS & Print styles
├── capacitor.config.json    # Capacitor Android config
├── package.json             # Scripts and dependencies
├── vite.config.ts           # Vite bundler config
└── README.md
```

---

## 📄 License

MIT License. Open source and free to use for personal and commercial attendance management.
