# Indus Appstore Submission Guide for Attendance Notebook Pro

Indus Appstore (PhonePe's Indian app store) requires standard Android app bundle (AAB) submission along with app store metadata and a valid Privacy Policy URL.

## 1. Privacy Policy URL for Indus Appstore
When filling out the Privacy Policy field in the Indus Developer Console, you can use your deployed app's public URL pointing to the privacy page:
- **Privacy Policy URL:** `https://ais-dev-efky5kksu2jm5zgceickzm-767041030593.asia-southeast1.run.app/privacy.html`
*(Once your app is deployed to production, you can also use your custom domain or shared app URL ending with `/privacy.html`).*

## 2. App Store Details
- **App Name:** Attendance Notebook Pro
- **Package Name:** `com.attendancenotebook.pro`
- **Category:** Productivity / Business / Tools
- **Short Description:** Daily attendance, overtime hours, monthly & yearly salary ledger calculator.
- **Monetization:** Contains Google AdMob banner and interstitial ads.

## 3. How to Build & Submit AAB
1. Export or clone the repository from GitHub.
2. Open terminal in the project directory:
   ```bash
   npm install
   npx cap sync android
   ```
3. Open Android Studio (`android` folder):
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
4. The generated App Bundle (`.aab`) will be located at:
   `android/app/build/outputs/bundle/release/app-release.aab`
5. Upload this `.aab` file along with your icon, screenshots, and the Privacy Policy URL (`/privacy.html`) on the **Indus Developer Console**.
