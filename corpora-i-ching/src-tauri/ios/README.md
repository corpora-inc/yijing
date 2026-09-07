# iOS builds

Use the current Tauri CLI's standard generated Xcode project. The old custom
project template pinned obsolete versions and excluded Apple Silicon simulators.
It is no longer used. Signing belongs in local Xcode configuration or CI secrets.

From `corpora-i-ching/`:

```sh
npm ci
npm run tauri -- ios init --ci
npm run tauri -- ios build --debug --target aarch64-sim --no-sign --ci
npm run tauri -- ios build --export-method app-store-connect --ci
```

App version comes from `src-tauri/tauri.conf.json`. Keep the existing bundle ID
`com.corpora-yijing.app` so updates preserve installed users' data. Before upload,
check the highest build number in App Store Connect and set a higher build number.
Use Xcode 26 or later with the iOS 26 SDK for current App Store submissions.

See `../../release/READINESS.md` for the release audit and pending store checks.
