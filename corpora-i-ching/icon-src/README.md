# App icon

`app-icon.svg` is the single source for every platform's icon: the 鼎 (ding) glyph
in #BB3333 on white, traced from the original 512px raster. `icon-manifest.json`
tells `tauri icon` how to use it:

- `default` renders the desktop icons in `src-tauri/icons/` (committed), the iOS
  App Store and home-screen sizes, and the legacy Android launcher icons.
- `android-foreground.svg` and `android-bg.svg` form the Android adaptive icon. The
  glyph is scaled to 76% so every stroke stays inside the 66dp safe zone and
  circular launcher masks never clip it. Tauri ignores `android_fg_scale` for SVG
  foregrounds, so the scale lives in the SVG itself.
- `android-monochrome.svg` is the Android 13+ themed icon.

## Regenerating

```sh
npm run icons        # after editing any SVG here; commit src-tauri/icons/
npm run icons:check  # desktop + any generated iOS/Android project
```

`icon.icns` is not byte-reproducible, so every render marks it modified. Commit it
only when the SVG master changed; `icons:check` verifies its PNG siblings instead.

`tauri ios init` and `tauri android init` always write Tauri's placeholder logo.
0.4.0 shipped that placeholder on both stores. `npm run ios:init` and
`npm run android:init` therefore run `npm run icons` after init, which writes
directly into `src-tauri/gen/`, and then `icons:check`. Never run the bare Tauri
init commands for a release build.

`npm run ios:verify` and `scripts/check-android-apk.py` compare the icons inside
the final IPA/APK with a fresh render of this master. Gradle release APKs shorten
resource paths, so run the APK check on a bundletool universal APK, or check the AAB:

```sh
python3 scripts/check-icons.py path/to/app.aab
```
