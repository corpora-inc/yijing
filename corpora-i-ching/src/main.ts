import { invoke } from "@tauri-apps/api/core";

interface Hexs {
  original: string[];
  transformed?: string[]; // Optional, matches Rust Option<Vec<String>>
  binary: string;
}

interface IChingHexagram {
  id: number;
  number: number;
  chinese_name: string;
  pinyin: string;
  binary: string;
  judgment_zh: string;
  judgment_en: string;
  judgment_es: string;
  english_name: string;
}

window.addEventListener("DOMContentLoaded", () => {
  const newReadingBtn = document.getElementById("new-reading");
  const hexagramOutputEl = document.getElementById("hexagram-output");

  if (newReadingBtn && hexagramOutputEl) {
    newReadingBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        // Invoke the Rust command "build" to generate the hexagram
        const hexagram = await invoke<Hexs>("build");
        console.log("Hexagram from build:", hexagram);

        // Use the binary to fetch data from the database
        const hexagramData = await invoke<IChingHexagram>("fetch_hexagram_data", {
          bin: hexagram.binary,
        });
        console.log("Hexagram data from DB:", hexagramData);

        // Format and display both the hexagram lines and DB data
        const output = [
          "Original Hexagram:",
          ...hexagram.original,
          ...(hexagram.transformed
            ? ["", "Transformed Hexagram:", ...hexagram.transformed]
            : []),
          "",
          "Hexagram Details:",
          `Number: ${hexagramData.number}`,
          `English Name: ${hexagramData.english_name}`,
          `Chinese Name: ${hexagramData.chinese_name} (${hexagramData.pinyin})`,
          `Judgment (EN): ${hexagramData.judgment_en}`,
          `Judgment (ZH): ${hexagramData.judgment_zh}`,
          `Judgment (ES): ${hexagramData.judgment_es}`,
        ].join("\n");

        hexagramOutputEl.textContent = output;
      } catch (error) {
        console.error("Failed to process hexagram:", error);
        hexagramOutputEl.textContent = `Error: ${error}`;
      }
    });
  }
});