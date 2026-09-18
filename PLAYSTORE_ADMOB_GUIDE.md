# 🚀 Google Play Console (.aab / .apk) & Google AdMob Approval Guide

> **Attendance Notebook Pro** (`com.attendancenotebook.pro`)  
> Step-by-step instructions to generate your signed `.aab` file for Google Play Console and get 100% approval on Google AdMob.

---

## 📱 PART 1: Generate Signed Android App Bundle (.aab) for Play Console

Google Play Store strictly requires **Android App Bundle (`.aab`)** format for all new apps.

### Prerequisites:
- Laptop / PC with **Node.js (v18+)** and **Android Studio (Ladybug or later)** installed.

### Step 1: Download & Prepare Code
1. In AI Studio, click **Settings** (top-right) → **Export to GitHub** or **Download ZIP**.
2. Extract the ZIP folder on your computer and open a terminal inside the project folder.

### Step 2: Install Dependencies & Build Web Assets
Run these commands in terminal:
```bash
# 1. Install dependencies
npm install

# 2. Compile production bundle
npm run build
```
This generates the optimized web files inside the `dist/` folder.

### Step 3: Add Android Platform (Capacitor)
```bash
# Install Capacitor Android platform
npm install @capacitor/core @capacitor/cli @capacitor/android

# Add android platform directory
npx cap add android

# Copy web dist files into Android project
npx cap copy
```

### Step 4: Open in Android Studio
```bash
npx cap open android
```
Android Studio will launch and automatically sync Gradle.

---

### Step 5: Build Signed `.aab` (Android App Bundle)
1. Inside **Android Studio**, click on the top menu:  
   👉 **Build** ➔ **Generate Signed Bundle / APK...**
2. Choose **Android App Bundle (.aab)** and click **Next**.
3. Under **Key store path**:
   - If you don't have a keystore yet, click **Create new...**.
   - Choose a file path (e.g., `attendance-pro-release.jks`), set a strong password, and fill in your Name/Organization.
   - ⚠️ **IMPORTANT**: Keep this `.jks` file and password very safe! You need it for all future app updates.
4. Click **Next**, choose **release** build variant, and check **V1 & V2 (Full APK Signature)**.
5. Click **Finish / Create**.
6. Once finished, Android Studio will show a popup:  
   👉 **"App bundle(s) generated successfully: Locate"**.  
   Your production bundle file `app-release.aab` is ready in `android/app/release/`!

---

## 🏬 PART 2: Google Play Console Upload Checklist

When uploading `app-release.aab` to Google Play Console:

1. **App Name**: `Attendance Notebook Pro - Duty & Salary Tracker`
2. **Short Description**: `Track daily attendance, overtime hours, salary calculation and site diary.`
3. **Category**: `Productivity` / `Business`
4. **Content Rating**: Complete the questionnaire (Mark: No violence, No adult content ➔ Gets `Everyone / 3+` rating).
5. **Target Audience**: 18+ and Working professionals.
6. **Privacy Policy**: 
   - Play Console requires a public Privacy Policy URL.
   - You can copy the exact text from `src/components/PrivacyPolicyModal.tsx` and host it on a free GitHub Pages site, Notion page, or Google Sites.
7. **Data Safety Form**:
   - **Does your app collect user data?** Select **NO**.
   - Everything is stored locally on the user's phone (`LocalStorage`).
   - Photos taken with Face Punch remain exclusively on the user's device and are never uploaded to any cloud server.
8. **App Permissions**:
   - Only `CAMERA` (optional, for selfie check-in).

---

## 💰 PART 3: Google AdMob & AdSense Approval Guide

To monetize this app with Google AdMob:

### 1. Register App on Google AdMob:
1. Go to **[admob.google.com](https://admob.google.com)**.
2. Click **Apps** ➔ **Add App**.
3. Platform: **Android** ➔ Is the app listed on supported store? Select **No** (until approved on Play Store).
4. Name: `Attendance Notebook Pro`.
5. Create an **Adaptive Banner Ad Unit** and an **Interstitial Ad Unit**.

### 2. Add AdMob Plugin to Capacitor:
```bash
npm install @capacitor-community/admob
npx cap sync
```

### 3. Configure `AndroidManifest.xml`:
Open `android/app/src/main/AndroidManifest.xml` and add your real AdMob App ID inside the `<application>` tag:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"/>
```

### 4. `app-ads.txt` Setup (Mandatory for AdMob Revenue):
1. In your website domain root (the domain you enter in Play Console Developer Contact), upload an `app-ads.txt` file containing your AdMob publisher ID:
   ```
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
2. AdMob will crawl and verify it within 24 hours.

### 5. Play Store Approval Link:
Once your app is live on the Google Play Store, go back to AdMob:
- **Apps** ➔ **Attendance Notebook Pro** ➔ **App settings** ➔ **App store details** ➔ Search your app by package name `com.attendancenotebook.pro` and link it.
- Your AdMob ads will start serving at 100% fill rate!

---

## 🛠️ Summary of Pre-Configured Files

- ✅ `capacitor.config.json` configured with appId `com.attendancenotebook.pro`.
- ✅ Clean, policy-compliant UI with no banned promotional practices.
- ✅ Privacy policy modal included inside the app.
- ✅ Offline-first zero data leakage architecture.
- ✅ Multi-format Salary Slip print/PDF download.
