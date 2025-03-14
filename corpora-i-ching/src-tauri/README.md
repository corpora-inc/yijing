
## Android

### === One-Time Setup ===

#### Install Android SDK, NDK, and required tools

```sh
sdkmanager --install "platform-tools" "platforms;android-34" "build-tools;34.0.0" "cmdline-tools;latest" "ndk;26.1.10909125"
```

#### Install Rust targets for Android

```sh
rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android
```

#### Install Cargo NDK helper

```sh
cargo install cargo-ndk
```

#### Generate Android project (if not already created)

```sh
cargo tauri android init
```

# Create a signing keystore (only if not created before)

```sh
keytool -genkeypair -v -keystore android-keystore.jks -storetype JKS -keyalg RSA -keysize 2048 -validity 10000 -alias corpora-iching-key
```


You end up with some fun stuff on your path and such when you work through all of the dependencies. Here's what I have in my .zshrc file:

```
export ANDROID_HOME="$HOME/Android"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export NDK_HOME="$ANDROID_HOME/ndk/26.1.10909125"
export PATH="$NDK_HOME:$PATH"
export PATH="$ANDROID_HOME/build-tools/34.0.0:$PATH"
export PATH="$NDK_HOME/toolchains/llvm/prebuilt/darwin-x86_64/bin:$PATH"
export CC_aarch64_linux_android="$NDK_HOME/toolchains/llvm/prebuilt/darwin-x86_64/bin/aarch64-linux-android21-clang"
export CXX_aarch64_linux_android="$NDK_HOME/toolchains/llvm/prebuilt/darwin-x86_64/bin/aarch64-linux-android21-clang++"
export CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER="$NDK_HOME/toolchains/llvm/prebuilt/darwin-x86_64/bin/aarch64-linux-android34-clang"
```


## Android
 === Repeatable Steps to Build and Deploy a New Version ===

# Build for local development
cargo build

# Build Rust for Android
cargo build --target aarch64-linux-android

# Build the Android APK
cargo tauri android build

# Sign the APK (use existing keystore)
apksigner sign --ks android-keystore.jks --out app-release-signed.apk gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk

# Verify the signed APK
apksigner verify app-release-signed.apk

# Install the APK on a connected Android device
adb uninstall com.corpora_i_ching.app || true
adb install app-release-signed.apk

# View logs to debug the application
adb logcat | grep com.corpora_i_ching.app

# Check if the SQLite database is correctly placed
adb shell ls -l /data/data/com.corpora_i_ching.app/files/db.sqlite3

# Check for SQLite errors
adb logcat | grep -i "sqlite"

# Generate an AAB for Google Play submission
cargo tauri android aab
