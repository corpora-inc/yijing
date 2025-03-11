import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';

// Define interfaces (unchanged)
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
    const [hasReading, setHasReading] = useState(false); // New state to track reading
    const [output, setOutput] = useState<string>(''); // Empty initial state

    const handleNewReading = async () => {
        try {
            const hexagram = await invoke<Hexs>("build");
            console.log("Hexagram from build:", hexagram);

            const originalHexData = await invoke<IChingHexagram>("fetch_hexagram_data", {
                bin: hexagram.binary,
            });
            console.log("Original hexagram data from DB:", originalHexData);

            let transformedHexData: IChingHexagram | null = null;
            if (hexagram.transformed_binary) {
                transformedHexData = await invoke<IChingHexagram>("fetch_hexagram_data", {
                    bin: hexagram.transformed_binary,
                });
                console.log("Transformed hexagram data from DB:", transformedHexData);
            }

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

            setOutput(formattedOutput);
            setHasReading(true); // Switch to reading state
        } catch (error) {
            console.error("Failed to process hexagram:", error);
            setOutput(`Error: ${error}`);
            setHasReading(true); // Show error in reading state
        }
    };

    return (
        <div className="flex flex-col items-center justify-center flex-1">
            {!hasReading ? (
                // No Reading State
                <div className="text-center">
                    <p className="mb-4 text-lg text-gray-700">
                        Concentrate on your question and click below to consult the I Ching.
                    </p>
                    <Button onClick={handleNewReading}>
                        New Reading
                    </Button>
                </div>
            ) : (
                // Reading State
                <div className="w-full">
                    <pre className="text-sm whitespace-pre-wrap">{output}</pre>
                </div>
            )}
        </div>
    );
};

export default App;