# Tauri + Vanilla TS

This template should help get you started developing with Tauri in vanilla HTML, CSS and Typescript.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)


## Dev

```
npm run tauri dev
```

------------

## Android checklist

Okay, lets look at your original checklist and see what we have left TODO:

Below is a comprehensive checklist of what you should verify and prepare before publishing your Tauri app to an app store. Although specifics may vary depending on which store you’re targeting (e.g., Apple App Store, Microsoft Store, etc.), these are the general categories and items you’ll need to cover:

---

### 1. App Metadata
- **App Name & Version:**
  Ensure the app name, version number, and build numbers are correctly set in your Tauri configuration (typically in your `tauri.conf.json` or equivalent).
- **Description & Keywords:**
  Write a clear, concise description and relevant keywords for search optimization.
- **Developer/Publisher Information:**
  Include your name (or company), contact details, and website.
- **Privacy Policy & Terms of Service:**
  Provide URLs or documents that outline your privacy practices and terms of use.
- **Category & Rating:**
  Select the appropriate category and age rating based on the app’s content.

---

### 2. App Icons & Graphics
- **App Icons:**
  Prepare high-quality icons in all required sizes. For example:
  - **Apple App Store:** 1024×1024 pixels, plus other sizes for different devices.
  - **Windows/Mac/Linux:** Ensure you have all necessary icon sizes as per each platform’s guidelines.
- **Splash/Launch Screens (if applicable):**
  Create and configure splash screens for a polished startup experience.
- **Screenshots & Promotional Assets:**
  Capture screenshots and, if needed, design promotional banners or feature graphics to be used in the store listings.

---

### 3. Tauri-Specific Configurations
- **Configuration File Check:**
  Review your `tauri.conf.json` (or similar) to verify that all metadata (name, version, description, etc.) is correctly specified.
- **Updater Settings:**
  If you’re using Tauri’s updater, ensure the configuration is set for production.
- **Custom Protocols & Assets:**
  Double-check any custom URL schemes or assets bundled with your app to ensure they’re correctly referenced.

---

### 4. Code Signing and Certificates
- **Digital Signing:**
  Obtain and apply code signing certificates:
  - **Windows:** Use a trusted certificate to sign your installer or executable.
  - **macOS:** Set up your provisioning profiles, signing identities, and plan for notarization.
- **Certificate Validity:**
  Confirm that all certificates are up to date and correctly integrated in your build process.

---

### 5. Build and Packaging
- **Production Build Settings:**
  Ensure that the app is built in production mode (no debug flags or unnecessary development assets).
- **Multi-Platform Targets:**
  Build separate binaries for each target platform (Windows, macOS, Linux) if applicable.
- **Bundle Size & Optimization:**
  Verify that your bundle is optimized and that extraneous files or dependencies are excluded.

---

### 6. Permissions and Privacy
- **Permissions Audit:**
  List and review all permissions the app requests. Make sure they’re necessary and properly disclosed.
- **Privacy Considerations:**
  Ensure your privacy policy clearly outlines any data collection, usage, and sharing practices.

---

### 7. Legal and Compliance
- **Store Guidelines:**
  Review and ensure compliance with the specific guidelines of the app store(s) where you plan to publish (e.g., Apple's App Store Review Guidelines, Microsoft Store Policies).
- **Third-Party Licenses:**
  Confirm that any third-party libraries or assets included in your app comply with their respective licenses.

---

### Final Testing and Review
- **Beta Testing:**
  Consider a final round of beta testing or a soft launch to catch any last-minute issues.
- **Documentation:**
  Update any documentation (e.g., release notes, user guides) to reflect the final product.
- **Submission Checklist:**
  Use a final checklist provided by the app store (if available) to ensure you’ve covered all necessary items.

---

By going through each of these sections, you can ensure that your Tauri app is fully prepared for a smooth submission process and stands the best chance for approval in the respective app stores.

----

We're targetting android first - the hopefully we can get to ios very soon.
