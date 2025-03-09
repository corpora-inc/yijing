import { invoke } from "@tauri-apps/api/core";

interface Hexs {
  original: string[];
  transformed?: string[]; // Optional, matches Rust Option<Vec<String>>
  binary: string;
  transformed_binary?: string; // Optional, matches Rust Option<String>
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

        // Fetch data for the original hexagram
        const originalHexData = await invoke<IChingHexagram>("fetch_hexagram_data", {
          bin: hexagram.binary,
        });
        console.log("Original hexagram data from DB:", originalHexData);

        // Fetch data for the transformed hexagram, if it exists
        let transformedHexData: IChingHexagram | null = null;
        if (hexagram.transformed_binary) {
          transformedHexData = await invoke<IChingHexagram>("fetch_hexagram_data", {
            bin: hexagram.transformed_binary,
          });
          console.log("Transformed hexagram data from DB:", transformedHexData);
        }

        // Format and display both hexagrams and their DB data
        const output = [
          "Original Hexagram:",
          ...hexagram.original,
          "",
          "Original Hexagram Details:",
          `Number: ${originalHexData.number}`,
          `English Name: ${originalHexData.english_name}`,
          `Chinese Name: ${originalHexData.chinese_name} (${originalHexData.pinyin})`,
          `Judgment (EN): ${originalHexData.judgment_en}`,
          `Judgment (ZH): ${originalHexData.judgment_zh}`,
          `Judgment (ES): ${originalHexData.judgment_es}`,
          ...(hexagram.transformed && transformedHexData
            ? [
              "",
              "Transformed Hexagram:",
              ...hexagram.transformed,
              "",
              "Transformed Hexagram Details:",
              `Number: ${transformedHexData.number}`,
              `English Name: ${transformedHexData.english_name}`,
              `Chinese Name: ${transformedHexData.chinese_name} (${transformedHexData.pinyin})`,
              `Judgment (EN): ${transformedHexData.judgment_en}`,
              `Judgment (ZH): ${transformedHexData.judgment_zh}`,
              `Judgment (ES): ${transformedHexData.judgment_es}`,
            ]
            : []),
        ].join("\n");

        hexagramOutputEl.textContent = output;
      } catch (error) {
        console.error("Failed to process hexagram:", error);
        hexagramOutputEl.textContent = `Error: ${error}`;
      }
    });
  }
});