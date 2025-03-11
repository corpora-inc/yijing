import React, { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

// Define interfaces (copied from your original)
interface IChingLine {
    line_number: number;
    text_zh: string;
    text_en: string;
    text_es: string;
}

interface Hexs {
    original: string[];
    transformed?: string[];
    binary: string;
    transformed_binary?: string;
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
    changing_lines: IChingLine[];
}

const App: React.FC = () => {
    // State to hold the hexagram output
    const [output, setOutput] = useState<string>('Click "New Reading" to generate a hexagram.');

    // Handler for generating a new reading
    const handleNewReading = async () => {
        try {
            // Invoke the Rust "build" command
            const hexagram = await invoke<Hexs>("build");
            console.log("Hexagram from build:", hexagram);

            // Fetch original hexagram data
            const originalHexData = await invoke<IChingHexagram>("fetch_hexagram_data", {
                bin: hexagram.binary,
            });
            console.log("Original hexagram data from DB:", originalHexData);

            // Fetch transformed hexagram data if it exists
            let transformedHexData: IChingHexagram | null = null;
            if (hexagram.transformed_binary) {
                transformedHexData = await invoke<IChingHexagram>("fetch_hexagram_data", {
                    bin: hexagram.transformed_binary,
                });
                console.log("Transformed hexagram data from DB:", transformedHexData);
            }

            // Format output (same as your original)
            const formattedOutput = [
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
                ...(originalHexData.changing_lines && originalHexData.changing_lines.length > 0
                    ? [
                        "",
                        "Changing Lines:",
                        ...originalHexData.changing_lines.flatMap((line) => [
                            `Line ${line.line_number}:`,
                            `  ZH: ${line.text_zh}`,
                            `  EN: ${line.text_en}`,
                            `  ES: ${line.text_es}`,
                            "",
                        ]),
                    ]
                    : []
                ),
                ...(hexagram.transformed && transformedHexData
                    ? [
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
                    : []
                ),
            ].join("\n");

            // Update state with the formatted output
            setOutput(formattedOutput);
        } catch (error) {
            console.error("Failed to process hexagram:", error);
            setOutput(`Error: ${error}`);
        }
    };

    return (
        <div>
            <h1>I Ching Reader</h1>
            <button id="new-reading" onClick={handleNewReading}>
                New Reading
            </button>
            <pre id="hexagram-output">{output}</pre>
        </div>
    );
};

export default App;