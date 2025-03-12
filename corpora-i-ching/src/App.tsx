import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NoReadingView from './components/NoReadingView';
import ReadingView from './components/ReadingView';
import LanguageSwitcher from './components/LanguageSwitcher';
import { LanguageProvider } from './context/LanguageContext';
import { Button } from '@/components/ui/button';

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
    id?: number; // Optional for uniqueness (manual increment)
    title: string;
    consultationCode: string;
    timestamp: string;
}

const AppContent: React.FC = () => {
    const [mode, setMode] = useState<'consultation' | 'browse'>('consultation');
    const [hasReading, setHasReading] = useState(false);
    const [hexs, setHexs] = useState<Hexs | null>(null);
    const [originalHex, setOriginalHex] = useState<IChingHexagram | null>(null);
    const [transformedHex, setTransformedHex] = useState<IChingHexagram | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [readings, setReadings] = useState<Reading[]>([]); // Store all readings

    // Load and sort readings from LocalStorage on mount
    useEffect(() => {
        const savedReadings = localStorage.getItem('readings');
        if (savedReadings) {
            const parsedReadings = JSON.parse(savedReadings) as Reading[];
            // Sort by timestamp (descending)
            const sortedReadings = parsedReadings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setReadings(sortedReadings);
            console.log('Loaded and sorted readings:', sortedReadings);
        }
    }, []);

    const saveReadings = (newReading: Reading) => {
        const updatedReadings = [...readings, newReading];
        // Sort by timestamp before saving
        const sortedReadings = updatedReadings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        localStorage.setItem('readings', JSON.stringify(sortedReadings));
        setReadings(sortedReadings);
        console.log('Saved and sorted readings:', sortedReadings);
    };

    const handleNewReading = async (title: string) => {
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

            // Save the reading to LocalStorage
            const newReading: Reading = {
                id: readings.length > 0 ? Math.max(...readings.map(r => r.id || 0)) + 1 : 1, // Manual ID increment
                title,
                consultationCode: hexagram.consultation_code,
                timestamp: new Date().toISOString(),
            };
            saveReadings(newReading);

            setHexs(hexagram);
            setOriginalHex(originalHexData);
            setTransformedHex(transformedHexData);
            setError(null);
            setHasReading(true);
        } catch (error) {
            console.error("Failed to process hexagram:", error);
            setError(String(error));
            setHasReading(true);
        }
    };

    const handleResetReading = () => {
        setHasReading(false);
        setHexs(null);
        setOriginalHex(null);
        setTransformedHex(null);
        setError(null);
    };

    const handleTabChange = (value: string) => {
        setMode(value as 'consultation' | 'browse');
        if (value === 'consultation') {
            handleResetReading();
            handleNewReading('Untitled Reading'); // Default title for tab change
        }
    };

    return (
        <div className="flex flex-col flex-1 h-screen relative">
            {/* Navigation Tabs */}
            <Tabs value={mode} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="consultation">Consultation</TabsTrigger>
                    <TabsTrigger value="browse">Browse</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center flex-1">
                {mode === 'consultation' ? (
                    !hasReading ? (
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
                    )
                ) : (
                    <div className="text-center">
                        <p className="mt-4 text-gray-700">Browse mode coming soon!</p>
                    </div>
                )}
            </div>

            {/* Language Switcher FAB (Bottom-Right) */}
            <LanguageSwitcher />

            {/* New Reading FAB (Top-Right) */}
            <Button
                onClick={handleResetReading}
                className="fixed top-4 right-4 rounded-full w-12 h-12 bg-gray-800 text-white hover:bg-gray-700 shadow-lg z-10"
            >
                +
            </Button>
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