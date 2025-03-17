#!/bin/bash
ANDROID_RES="src-tauri/gen/android/app/src/main/res"
SOURCE="src-tauri/android-icons/xxxhdpi"

for SIZE in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
    cp "$SOURCE/ic_launcher.png" "$ANDROID_RES/mipmap-$SIZE/ic_launcher.png"
    cp "$SOURCE/ic_launcher_foreground.png" "$ANDROID_RES/mipmap-$SIZE/ic_launcher_foreground.png"
    cp "$SOURCE/ic_launcher_background.png" "$ANDROID_RES/mipmap-$SIZE/ic_launcher_background.png"
done
