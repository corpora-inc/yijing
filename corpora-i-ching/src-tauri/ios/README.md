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

## Headless App Store signing

For an API-authenticated release, install an active `IOS_APP_STORE` provisioning
profile for this bundle ID that includes the distribution certificate already in
the signing keychain. Check profile and certificate expiration before building.
Never commit private keys, keystores, profile contents, or passwords.

After `ios init`, configure the generated project's release build settings:

- `CODE_SIGN_STYLE = Manual`
- `CODE_SIGN_IDENTITY = Apple Distribution`
- `PROVISIONING_PROFILE_SPECIFIER = <installed profile name>`

When regenerating the project with XcodeGen, make the Rust pre-build script start
with `cd "${PROJECT_DIR:?}/../.." &&` so the CLI runs beside `tauri.conf.json`.

Archive with `npm run tauri -- ios build --archive-only --ci`, then export with
`xcodebuild -exportArchive`. The export options must specify `app-store-connect`,
manual signing, the development team, and a `provisioningProfiles` dictionary
mapping `com.corpora-yijing.app` to that profile. Validate the resulting IPA with
Apple's upload tooling before submitting it.

`src-tauri/Info.ios.plist` declares that the app uses no non-exempt encryption.
Reassess that declaration if the app's cryptographic functionality changes.

Add `../../ios/PrivacyInfo.xcprivacy` to the generated Xcode target as a resource
so it lands at the root of `Yijing.app`. Verify the final IPA contains it. The
manifest declares local file-metadata access and no tracking or data collection.

Run Android and iOS Tauri commands sequentially for the same checkout. Their
local build-options service can otherwise mix platform environments, even with
separate Cargo target directories.
