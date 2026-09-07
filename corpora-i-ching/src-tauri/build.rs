fn main() {
    // Apply at the final library link in both Tauri and Gradle's Rust rebuild.
    // A nested Cargo config can be missed when invoked from the frontend root,
    // and an inherited NDK r26 linker otherwise emits 4 KB LOAD segments.
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("android") {
        println!("cargo:rustc-link-arg-cdylib=-Wl,-z,max-page-size=16384");
    }
    tauri_build::build();
}
