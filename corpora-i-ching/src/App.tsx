import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import NoReadingView from './components/NoReadingView';
import ReadingView from './components/ReadingView';
import LanguageSwitcher from './components/LanguageSwitcher';
import { LanguageProvider } from './context/LanguageContext';
import { Book, History, Search, Trash2 } from 'lucide-react';
import { info } from '@tauri-apps/plugin-log';
import { formatDistanceToNow } from 'date-fns'; // Import date-fns
import BrowseView from './components/BrowseView';

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
    name_zh: string;
    name_en: string;
    name_es: string;
    name_pinyin: string;
    binary: string;
    judgment_zh: string;
    judgment_en: string;
    judgment_es: string;
    judgment_pinyin: string;
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
        }
    }, []);

    const saveReadings = (updatedReadings: Reading[]) => {
        const sortedReadings = updatedReadings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        localStorage.setItem('readings', JSON.stringify(sortedReadings));
        setReadings(sortedReadings);
    };

    const handleNewReading = async (title: string) => {
        try {
            info("generate_reading");
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
        if (id === undefined) return;
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
            handleResetReading();
        }
    };

    return (
        <div className="flex flex-col flex-1 h-screen relative">
            {/* Navigation Tabs */}
            <Tabs value={mode} onValueChange={handleTabChange} className="w-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 gap-2 p-2 bg-gray-100">
                    <TabsTrigger
                        value="consultation"
                        className="flex flex-col items-center justify-center h-20 p-4 bg-white rounded-lg shadow-md hover:bg-gray-200 transition-all duration-200 data-[state=active]:bg-gray-300"
                    >
                        <Book className="h-12 w-12" />
                        <span className="text-sm mt-1">Consult</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="history"
                        className="flex flex-col items-center justify-center h-20 p-4 bg-white rounded-lg shadow-md hover:bg-gray-200 transition-all duration-200 data-[state=active]:bg-gray-300"
                    >
                        <History className="h-12 w-12" />
                        <span className="text-sm mt-1">History</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="browse"
                        className="flex flex-col items-center justify-center h-20 p-4 bg-white rounded-lg shadow-md hover:bg-gray-200 transition-all duration-200 data-[state=active]:bg-gray-300"
                    >
                        <Search className="h-12 w-12" />
                        <span className="text-sm mt-1">Browse</span>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="consultation" className="flex-1 mt-16">
                    {!hasReading ? (
                        <NoReadingView onNewReading={handleNewReading} />
                    ) : (
                        <div className="relative w-full h-full">
                            <ReadingView
                                hexs={hexs!}
                                originalHex={originalHex!}
                                transformedHex={transformedHex}
                                error={error}
                                onNewConsultation={handleResetReading}
                            />
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="history" className="flex-1 mt-12">
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
                                            className="flex-1 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2"
                                            onClick={() => handleRevisitReading(reading.consultationCode)}
                                        >
                                            <span className="font-medium break-words">{reading.title || 'Untitled'}</span>
                                            <span className="text-sm text-gray-500 block sm:inline break-words">
                                                {formatDistanceToNow(new Date(reading.timestamp), { addSuffix: true })}
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
                <TabsContent value="browse" className="flex-1 mt-12">
                    <BrowseView />
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