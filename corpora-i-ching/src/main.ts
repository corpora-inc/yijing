import { invoke } from "@tauri-apps/api/core";

window.addEventListener("DOMContentLoaded", () => {
  const newReadingBtn = document.getElementById("new-reading");
  const hexagramOutputEl = document.getElementById("hexagram-output");

  if (newReadingBtn && hexagramOutputEl) {
    newReadingBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        // Invoke the Rust command "build" which returns an array of strings.
        const hexagram = await invoke<string[]>("build");
        // Display the hexagram, joining each line with a newline.
        hexagramOutputEl.textContent = hexagram.join("\n");
      } catch (error) {
        console.error("Failed to generate hexagram:", error);
        hexagramOutputEl.textContent = "Error generating hexagram.";
      }
    });
  }
});
