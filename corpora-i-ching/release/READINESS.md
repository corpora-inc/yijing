# Yijing 0.4.0 release readiness

Audit date: 2026-09-07. This file distinguishes prepared code from store acceptance.

## Store identity and observed status

Authenticated release audit: 2026-09-07. Existing service accounts and signing
materials were recovered locally; no credentials are stored in this repository.

- Android: `com.corpora_yijing.app`. The previous production release was 0.3.9
  (3009). The Publisher API accepted 0.4.0 (4000), validated the edit, and committed
  the production release with updated copy, release notes, and three screenshots.
  Store review/distribution is distinct from a successful API commit.
- iOS: `com.corpora-yijing.app`, Apple ID `6744656859`. Build 0.4.0 passed Apple
  validation, uploaded successfully, processed as `VALID`, and is attached to the
  0.4.0 App Store version. Submission completed at 19:14 UTC; both the version
  and review submission report `WAITING_FOR_REVIEW`. Updated native iPhone and
  iPad screenshots have finished processing.
- The iOS update replaces the accidental “Thought for a couple of seconds” listing
  prefix. The age-rating questionnaire now includes the new capability questions
  and occasional literary references to wine, weapons, and conflict. No pricing
  or territory changes were made.
- An older Mac 0.3.6 submission remains rejected with unresolved review issues.
  This mobile release does not resolve or resubmit that separate Mac submission.
- These API observations do not certify every account-level policy, agreement,
  tax, banking, or console-only notice, nor establish final review approval.

## Build requirements

- Use Node 22.12+ and `npm ci`; dependencies and Tauri CLI are lockfile-controlled.
- Android: current generated project targets and compiles API 36, with AGP 8.11.
  Use NDK r28 or newer for default 16 KB native page alignment. This Mac has
  NDK r29 installed; its inherited NDK/linker settings were r26. Explicit Android
  linker flags in `src-tauri/build.rs` enforce 16 KB alignment in both
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

The starting default branch had 25 open Dependabot alerts. After PR #32 merged,
GitHub closed 24; the one remaining alert is the Linux-only GLib issue below. JavaScript dependencies
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

## Signed release validation

- Android retains all four shipping ABIs: ARM64, ARMv7, x86, and x86_64. Bundletool
  reports `PAGE_ALIGNMENT_16K`; its generated universal APK passes ZIP alignment
  and every ARM64/x86_64 ELF LOAD segment check. Version code is 4000, targeting
  and compiling API 36.
- On an Android 36 ARM64 emulator reporting `PAGE_SIZE=16384`, a reading created
  in Play's unprotected 0.3.9 APKs survived an in-place update to 0.4.0 and reopened
  correctly. Both builds were re-signed with the same local test key. The final
  AAB's ARM64 library and frontend assets are byte-identical to that tested APK.
  The new build no longer displays the old 16 KB compatibility warning.
- iOS signed archive and IPA export passed with Xcode 26.6 / iOS SDK 26.5. Apple
  validation reported no errors, and processing completed as `VALID`. The final
  IPA contains the privacy manifest and export-compliance declaration.
- Apple warning 90068 is forward-looking: from spring 2027, uploads will require
  minimum iOS 15. This release retains currently accepted iOS 14 support.
- `npm run ios:init` includes the privacy manifest in the generated Xcode target.
  `npm run ios:verify -- path/to/Yijing.ipa` checks the final exported declarations.
- Native iPhone/iPad simulator screenshots and Android emulator screenshots show
  the new design. Review approval and final public availability must still be
  checked after submission; do not equate an accepted upload with a live release.

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
