# I-Ching-app

**A modern, privacy-focused, multiplatform application for consulting the ancient wisdom of the I Ching. Built with Tauri.**

## ✨ Features

- **Consult the I Ching:** Perform readings and receive interpretations based on the ancient texts.
- **Offline first:** Fully functional without requiring an internet connection.
- **Privacy by design:** No user accounts, no tracking, no data collection. Your consultations remain private.
- **Multiplatform:** Runs on Desktop (Windows, macOS, Linux), iOS, and Android from a single codebase.
- **Modern UI:** Clean, intuitive, and accessible user interface.

## ⭐ Star the Project

If you find this project useful or interesting, please consider giving it a star on GitHub. Your support helps us grow and reach more contributors!

[![Star on GitHub](https://img.shields.io/github/stars/corpora-inc/yijing.svg?style=social)](https://github.com/corpora-inc/yijing/stargazers)

## 🚀 Get the App (Testing)

We are currently in the testing phase. Help us improve the app by joining our beta programs:

- **iOS:** [Join the TestFlight Beta](https://testflight.apple.com/join/pRuaCtHC)
- **Android:** [Get it on Google Play](https://play.google.com/store/apps/details?id=com.corpora_yijing.app)

## 💻 Tech Stack

- **Core Framework:** [Tauri](https://tauri.app/)
- **Languages:** [TypeScript](https://www.typescriptlang.org/) and [Rust](https://www.rust-lang.org/)
- **Styling:** [Tailwind](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Package Manager:** [npm](https://www.npmjs.com/)

## 🛠️ Development Setup

### **Prerequisites:**

1. [Node.js](https://nodejs.org/) (LTS version recommended) & npm

   > **Recommended:** use [nvm](https://github.com/nvm-sh/nvm) to install and manage Node versions.

   #### Install nvm (if you don’t have it)

   ```bash
   /usr/bin/curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
   ```

   #### Restart your shell, then:

   ```bash
   nvm install --lts
   nvm use --lts
   ```

   Or install Node LTS via your OS package manager:

   - **macOS:**
     ```bash
     brew install node
     ```
   - **Debian/Ubuntu:**
     ```bash
     sudo apt update
     ```
     ```bash
     sudo apt install nodejs npm
     ```
   - **Windows (with Chocolatey):**
     ```bash
     choco install nodejs-lts -y
     ```

   Make sure you have at least **Node 16**.

2. [Rust](https://www.rust-lang.org/tools/install) & Cargo

   #### Fetch and run the official installer

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

   #### In your shell (or reopen it):

   ```bash
   source ~/.cargo/env
   ```

   #### Make sure you’re up to date

   ```bash
   rustup update
   ```

3.  [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites) (Ensure you follow the setup for your specific Operating System, including mobile development requirements if applicable).

    Tauri needs some native toolkits to build its WebView.

    #### macOS

    ##### Xcode Command-Line Tools

    ```bash
    xcode-select --install
    ```

    #### Ubuntu / Debian

    ```bash
    sudo apt install -y build-essential pkg-config libgtk-3-dev libwebkit2gtk-4.0-dev
    ```

    #### Fedora / RHEL
    ```bash
    sudo dnf install -y gcc-c++ make pkgconfig gtk3-devel webkit2gtk3-devel
    ```

    #### Windows

    1.  **Visual Studio 2022 Build Tools**
        - Download & install the “Desktop development with C++” workload (include Windows 10+ SDK).
    2.  **Windows SDK** (if not bundled)
    3.  **(Optional) Python 2** for some Node native modules:
        ```bash
        choco install python2 -y
        ```
    4.  Ensure your toolchain target is set:
        ```bash
        rustup default stable-x86_64-pc-windows-msvc
        ```


### Enviroment setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/corpora-inc/yijing.git
    cd yijing
    ```
2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```
3.  **Run in development mode (Desktop):**
    ```bash
    npm run tauri dev
    ```
    This will open the app in a development window with hot-reloading for the frontend.
4.  **Build the application (Desktop):**
    ```bash
    npm run tauri build
    ```
    Find the installers/binaries in `src-tauri/target/release/bundle/`.
5.  **Mobile Development:**
    - Refer to the official [Tauri Mobile documentation](https://tauri.app/v1/guides/mobile/) for detailed instructions on setting up emulators/simulators and running/building for iOS and Android.
    - Common commands: `npm run tauri android dev`, `npm run tauri ios dev`, `npm run tauri android build`, `npm run tauri ios build`.

#### Tips & gotchas

- **Updating Tauri:** upgrade both the CLI and the core crates in lockstep:
  cargo install tauri-cli --force
  npm install @tauri-apps/cli@latest
- **Troubleshooting:**
  - On macOS, if the build fails in `cocoa`, make sure Xcode tools are current.
  - On Windows, double-check that the MSVC toolchain is active (`rustup show`).

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

Please read our contributions guidelines `CONTRIBUTING.md` for more details


## ❓ Support & Issues

If you encounter bugs, have suggestions, or need help, please file an issue on the GitHub repository:

- [**Report a bug / Request a feature**](https://github.com/corpora-inc/yijing/issues)

## 🔒 Privacy Policy

We respect your privacy. The application is designed to work offline and does not collect or transmit any personal data.

- [Read the full Privacy Policy](https://github.com/corpora-inc/yijing/blob/main/corpora-i-ching/PRIVACY.md)

## Contact

- **Email:** team@encorpora.io
- **GitHub:** [https://github.com/corpora-inc](https://github.com/corpora-inc)
- **Website:** [https://encorpora.io](https://encorpora.io)
