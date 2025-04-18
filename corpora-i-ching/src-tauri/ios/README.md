# 📱 iOS Build Configuration for Tauri

This directory contains iOS-specific configuration for building and signing the app using [Tauri's mobile toolchain](https://tauri.app/v2/guides/building/mobile/overview/). It supports:

- Manual code signing with reusable provisioning profiles and certificates
- Clean separation of secrets via `.env` file
- Regeneration of `project.yml` from a safe, tracked template
- Deployment via `cargo tauri ios build` to a physical device or IPA export

---

## 🧱 Structure

```
src-tauri/
├── gen/
│   └── apple/
│       └── project.yml         # generated from template
├── ios/
│   ├── project.yml.template    # template with placeholders
│   ├── .env                    # local, untracked semi-secrets
│   ├── ExportOptions.plist     # controls IPA export type (e.g. app-store-connect)
│   └── README.md
```

---

## 🔐 Environment Variables

Create a local `ios/.env` file like this:

```env
CODE_SIGN_STYLE=Manual
CODE_SIGN_IDENTITY="iPhone Distribution: Your Company Name (TEAMID1234)"
PROVISIONING_PROFILE=your-profile-uuid
DEVELOPMENT_TEAM=TEAMID1234
```

> Never commit `.env`. It's in `.gitignore`.

---

## 🏗️ Building for iOS


```bash
cd ios/
./generate.sh
cd ..
cargo tauri ios init
cargo tauri icon icons/512.png
cp ios/ExportOptions.plist gen/apple/
cargo tauri ios build
```

## 🛠 Tips

- If signing fails, ensure the certificate and profile are valid and linked in the [Apple Developer Portal](https://developer.apple.com/account/).
- Your Apple ID is **not** required during the build. Avoid committing it.

## 📚 References

- [`project.yml` template upstream](https://github.com/tauri-apps/tauri/blob/dev/crates/tauri-cli/templates/mobile/ios/project.yml)
- [`ExportOptions.plist` upstream](https://github.com/tauri-apps/tauri/blob/dev/crates/tauri-cli/templates/mobile/ios/ExportOptions.plist)
- [Xcode code signing docs](https://developer.apple.com/documentation/bundleresources/entitlements)

https://github.com/yonaskolb/XcodeGen
