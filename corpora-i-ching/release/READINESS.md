# Yijing 0.4.0 release readiness

Audit date: 2026-09-07. This file distinguishes prepared code from store acceptance.

## Store identity and observed status

- Android: `com.corpora_yijing.app` — [public listing](https://play.google.com/store/apps/details?id=com.corpora_yijing.app) reachable.
- iOS: `com.corpora-yijing.app`, Apple ID `6744656859` — [public listing](https://apps.apple.com/us/app/y%C3%ACj%C4%ABng/id6744656859) shows 0.3.9, released June 10, 2025.
- Public availability does not establish account good standing, policy compliance,
  pending review status, or availability in every territory. Console credentials
  were not available during this audit. No store upload or metadata edit was made.
- The Apple listing contains an accidental “Thought for a couple of seconds”
  prefix. `store-copy.txt` supplies replacement copy and release notes.

## Build requirements

- Use Node 22.12+ and `npm ci`; dependencies and Tauri CLI are lockfile-controlled.
- Android: current generated project targets and compiles API 36, with AGP 8.11.
  Use NDK r28 or newer for default 16 KB native page alignment. This Mac has
  NDK r29 installed; its inherited NDK/linker settings were r26. Explicit Android
  linker flags in `src-tauri/.cargo/config.toml` enforce 16 KB alignment in both
  Tauri and Gradle builds. Setting NDK_HOME alone did not protect the second build.
- iOS: use Xcode 26+ and the iOS 26 SDK. This Mac has Xcode 26.6. Tauri now
  generates the standard project, replacing the obsolete manual-signing template.
- Keep both existing bundle identifiers unchanged. Keep version 0.4.0 consistent
  across package.json, Cargo.toml, and tauri.conf.json. Verify the highest uploaded
  Android versionCode and Apple build number before selecting upload build numbers.

References: [Google target API requirements](https://developer.android.com/google/play/requirements/target-sdk),
[16 KB page sizes](https://developer.android.com/guide/practices/page-sizes),
[Apple SDK requirements](https://developer.apple.com/news/upcoming-requirements/).

## Dependency security

The starting default branch had 25 open Dependabot alerts. JavaScript dependencies
were upgraded to patched releases and `npm audit` reports zero vulnerabilities.
Rust dependencies were refreshed, including Tauri 2.11.5, serde_with 3.22.0, and
rusqlite 0.40.2 with a current bundled SQLite. `cargo audit` reports zero
vulnerability findings, plus 16 upstream unmaintained-package warnings and the
GLib unsoundness warning described below. No warnings are hidden.

One known upstream constraint remains: Tauri's Linux GTK3 dependency graph uses
GLib 0.18.5, affected by RUSTSEC-2024-0429. The fix requires GLib 0.20+, incompatible
with that upstream graph. This dependency is not part of Android or iOS builds.
Do not suppress/dismiss the alert or claim that the repository has zero advisories.
See [upstream discussion](https://github.com/tauri-apps/tauri/issues/12919) and
[RustSec](https://rustsec.org/advisories/RUSTSEC-2024-0429).

## Store release completion

With authenticated access, inspect Google Play policy status, App content and Data
safety, production tracks, signing, and API/page-size notices. Check App Store
Connect agreements, age rating, app privacy, build processing, and review messages.
Confirm these against the built artifact and actual app behavior rather than
inferring answers from the public listing.

Build signed release artifacts using the existing upload key and Apple profile.
Check every packaged Android native library for 16 KB alignment and test on a
16 KB emulator. Run the iOS archive validation, verify required privacy manifests,
and smoke-test saved-history upgrade behavior on installed copies of 0.3.x.
Upload new screenshots and the prepared store copy, submit updates, and record
store acceptance and final live versions here.

## Verify the packaged Android library

Run this against the finished APK, not an intermediate `.so`. It checks ZIP
alignment and every packaged ARM64/x86_64 ELF LOAD segment, and fails if no
64-bit libraries are present. The check rejected a real 4 KB-aligned output
that passed `zipalign`; this is why both checks are necessary.

```sh
python3 scripts/check-android-apk.py path/to/app.apk \
  --zipalign "$ANDROID_HOME/build-tools/36.0.0/zipalign"
```

Set `NDK_HOME` to locate llvm-readelf. Signed release APKs derived from the
release AAB need the same validation; a debug APK is not proof of a signed release.
