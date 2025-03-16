import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import NoReadingView from './components/NoReadingView';
import ReadingView from './components/ReadingView';
import LanguageSwitcher from './components/LanguageSwitcher';
import { LanguageProvider } from './context/LanguageContext';
import { Book, History, Search, Trash2 } from 'lucide-react';
import { info } from '@tauri-apps/plugin-log'; // Add this import


// Define interfaces
export interface IChingLine {
    line_number: number;
    text_zh: string;
    text_en: string;
    text_es: string;
    text_pinyin: string;
}

export interface Hexs {
    consultation_code: string;
    transformed_code: string | null;
    binary: string;
    transformed_binary: string | null;
}

export interface IChingHexagram {
    id: number;
    number: number;
    chinese_name: string;
    pinyin: string;
    binary: string;
    judgment_zh: string;
    judgment_en: string;
    judgment_es: string;
    judgment_pinyin: string;
    english_name: string;
    changing_lines: IChingLine[];
}

interface Reading {
    id?: number;
    title: string;
    consultationCode: string;
    timestamp: string;
}

const AppContent: React.FC = () => {
    const [mode, setMode] = useState<'consultation' | 'browse' | 'history'>('consultation');
    const [hasReading, setHasReading] = useState(false);
    const [hexs, setHexs] = useState<Hexs | null>(null);
    const [originalHex, setOriginalHex] = useState<IChingHexagram | null>(null);
    const [transformedHex, setTransformedHex] = useState<IChingHexagram | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [readings, setReadings] = useState<Reading[]>([]);

    // Load and sort readings from LocalStorage on mount
    useEffect(() => {
        const savedReadings = localStorage.getItem('readings');
        if (savedReadings) {
            const parsedReadings = JSON.parse(savedReadings) as Reading[];
            const sortedReadings = parsedReadings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setReadings(sortedReadings);
            // console.log('Loaded and sorted readings:', sortedReadings);
        }
    }, []);

    const saveReadings = (updatedReadings: Reading[]) => {
        const sortedReadings = updatedReadings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        localStorage.setItem('readings', JSON.stringify(sortedReadings));
        setReadings(sortedReadings);
        // console.log('Saved and sorted readings:', sortedReadings);
    };

    const handleNewReading = async (title: string) => {
        try {
            info("generate_reading")
            const hexagram = await invoke<Hexs>("generate_reading");
            info("Hexagram from generate_reading: " + JSON.stringify(hexagram));

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

            const newReading: Reading = {
                id: readings.length > 0 ? Math.max(...readings.map(r => r.id || 0)) + 1 : 1,
                title,
                consultationCode: hexagram.consultation_code,
                timestamp: new Date().toISOString(),
            };
            saveReadings([...readings, newReading]);

            setHexs(hexagram);
            setOriginalHex(originalHexData);
            setTransformedHex(transformedHexData);
            setError(null);
            setHasReading(true);
        } catch (error) {
            console.error("Failed to generate reading:", error);
            setError(String(error));
            setHasReading(true);
        }
    };

    const handleRevisitReading = async (consultationCode: string) => {
        try {
            const hexagram = await invoke<Hexs>("rehydrate_reading", { consultationCode });
            console.log("Rehydrated hexagram from rehydrate_reading with code:", consultationCode, hexagram);

            const originalHexData = await invoke<IChingHexagram>("fetch_hexagram_data", {
                bin: hexagram.binary,
            });
            console.log("Rehydrated original hexagram data from DB:", originalHexData);

            let transformedHexData: IChingHexagram | null = null;
            if (hexagram.transformed_binary) {
                transformedHexData = await invoke<IChingHexagram>("fetch_hexagram_data", {
                    bin: hexagram.transformed_binary,
                });
                console.log("Rehydrated transformed hexagram data from DB:", transformedHexData);
            }

            setHexs(hexagram);
            setOriginalHex(originalHexData);
            setTransformedHex(transformedHexData);
            setError(null);
            setHasReading(true);
            setMode('consultation');
        } catch (error) {
            console.error("Failed to revisit reading:", error);
            setError(String(error));
        }
    };

    const handleDeleteReading = (id: number | undefined) => {
        if (id === undefined) return; // Guard against undefined IDs
        const updatedReadings = readings.filter((reading) => reading.id !== id);
        saveReadings(updatedReadings);
    };

    const handleResetReading = () => {
        setHasReading(false);
        setHexs(null);
        setOriginalHex(null);
        setTransformedHex(null);
        setError(null);
    };

    const handleTabChange = (value: string) => {
        setMode(value as 'consultation' | 'browse' | 'history');
        if (value === 'consultation') {
            handleResetReading(); // Always reset to NoReadingView when clicking Consultation tab
        }
    };

    return (
        <div className="flex flex-col flex-1 h-screen relative">
            {/* Navigation Tabs */}
            {/* Make these tabs much bigger and more pronounced */}
            <Tabs value={mode} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3 gap-0">
                    <TabsTrigger value="consultation">
                        <Book className="h-6 w-6" />
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="h-6 w-6" />
                    </TabsTrigger>
                    <TabsTrigger value="browse">
                        <Search className="h-6 w-6" />
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="consultation" className="flex items-center justify-center h-full">
                    {!hasReading ? (
                        <NoReadingView onNewReading={handleNewReading} />
                    ) : (
                        <div className="relative w-full h-full">
                            <ReadingView
                                hexs={hexs!}
                                originalHex={originalHex!}
                                transformedHex={transformedHex}
                                error={error}
                            />
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="history" className="flex items-center justify-center h-full">
                    <div className="p-4">
                        <h2 className="text-xl font-semibold mb-4">Reading History</h2>
                        {readings.length === 0 ? (
                            <p className="text-gray-500">No readings yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {readings.map((reading) => (
                                    <li
                                        key={reading.id}
                                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-100"
                                    >
                                        <span
                                            className="flex-1 cursor-pointer"
                                            onClick={() => handleRevisitReading(reading.consultationCode)}
                                        >
                                            <span className="font-medium">{reading.title || 'Untitled'}</span>
                                            <span className="text-sm text-gray-500 ml-2">
                                                {new Date(reading.timestamp).toLocaleString()}
                                            </span>
                                        </span>
                                        <button
                                            onClick={() => handleDeleteReading(reading.id)}
                                            className="text-red-500 hover:text-red-700"
                                            aria-label="Delete reading"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="browse" className="flex items-center justify-center h-full">
                    <div className="p-4">
                        <h2 className="text-xl font-semibold mb-4">Browse Corpus</h2>
                        <p className="text-gray-700">Explore translations and commentaries (coming soon).</p>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Language Switcher FAB (Bottom-Right) */}
            <LanguageSwitcher />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
};

export default App;