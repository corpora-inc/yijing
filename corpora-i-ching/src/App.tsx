// App.tsx
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import NoReadingView from './components/NoReadingView';
import ReadingView from './components/ReadingView';
import LanguageSwitcher from './components/LanguageSwitcher';
import { LanguageProvider } from './context/LanguageContext';
import { Book, History, Search, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

export interface ConsultationInterpretation {
    text: string;
    attribution: string;
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
    const [interpretation, setInterpretation] = useState<ConsultationInterpretation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCasting, setIsCasting] = useState(false);
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

    const fetchInterpretation = async (consultationCode: string) => {
        try {
            const interpretationData = await invoke<ConsultationInterpretation | null>('fetch_interpretation', {
                consultationCode,
            });
            setInterpretation(interpretationData);
        } catch (error) {
            console.error('Failed to fetch interpretation:', error);
            setInterpretation(null);
        }
    };

    const handleNewReading = async (title: string) => {
        if (isCasting) return;
        setIsCasting(true);
        try {
            const hexagram = await invoke<Hexs>("generate_reading");

            const originalHexData = await invoke<IChingHexagram>("fetch_hexagram_data", {
                bin: hexagram.binary,
            });

            let transformedHexData: IChingHexagram | null = null;
            if (hexagram.transformed_binary) {
                transformedHexData = await invoke<IChingHexagram>("fetch_hexagram_data", {
                    bin: hexagram.transformed_binary,
                });
            }

            await fetchInterpretation(hexagram.consultation_code);

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
        } finally {
            setIsCasting(false);
        }
    };

    const handleRevisitReading = async (consultationCode: string) => {
        try {
            const hexagram = await invoke<Hexs>("rehydrate_reading", { consultationCode });

            const originalHexData = await invoke<IChingHexagram>("fetch_hexagram_data", {
                bin: hexagram.binary,
            });

            let transformedHexData: IChingHexagram | null = null;
            if (hexagram.transformed_binary) {
                transformedHexData = await invoke<IChingHexagram>("fetch_hexagram_data", {
                    bin: hexagram.transformed_binary,
                });
            }

            await fetchInterpretation(consultationCode);

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
        setInterpretation(null);
        setError(null);
    };

    const handleTabChange = (value: string) => {
        setMode(value as 'consultation' | 'browse' | 'history');
        if (value === 'consultation') {
            handleResetReading();
        }
    };

    return (
        <div className="app-shell">
            <header className="app-header">
                <div className="brand"><span className="brand-seal" lang="zh">易</span><div><h1>Yìjīng</h1><p>THE BOOK OF CHANGES</p></div></div>
                <LanguageSwitcher />
            </header>
            <Tabs value={mode} onValueChange={handleTabChange} className="w-full flex flex-col">
                <TabsList className="app-navigation" aria-label="Main navigation">
                    <TabsTrigger
                        value="consultation"
                        className="nav-tab"
                    >
                        <Book className="h-4 w-4" />
                        <span className="text-sm">Consult</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="history"
                        className="nav-tab"
                    >
                        <History className="h-4 w-4" />
                        <span className="text-sm">History</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="browse"
                        className="nav-tab"
                    >
                        <Search className="h-4 w-4" />
                        <span className="text-sm">Browse</span>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="consultation" className="page-content">
                    {!hasReading ? (
                        <><NoReadingView onNewReading={handleNewReading} isCasting={isCasting} />{error && <p role="alert" className="error-message">{error}</p>}</>
                    ) : (
                        <div className="relative w-full h-full">
                            <ReadingView
                                hexs={hexs!}
                                originalHex={originalHex!}
                                transformedHex={transformedHex}
                                error={error}
                                onNewConsultation={handleResetReading}
                                interpretation={interpretation}
                            />
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="history" className="page-content">
                    <div className="history-view">
                        <p className="eyebrow">YOUR JOURNAL</p><h2 className="page-title">Reading History</h2>
                        {readings.length === 0 ? (
                            <p className="empty-state">No readings yet. Your consultations will appear here.</p>
                        ) : (
                            <ul className="space-y-2">
                                {readings.map((reading) => (
                                    <li
                                        key={reading.id}
                                        className="history-entry"
                                    >
                                        <button
                                            className="history-open"
                                            onClick={() => handleRevisitReading(reading.consultationCode)}
                                        >
                                            <span className="font-medium break-words">{reading.title || 'Untitled'}</span>
                                            <span className="text-sm text-gray-500 block sm:inline break-words">
                                                {formatDistanceToNow(new Date(reading.timestamp), { addSuffix: true })}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReading(reading.id)}
                                            className="delete-reading"
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
                <TabsContent value="browse" className="page-content">
                    <BrowseView />
                </TabsContent>
            </Tabs>

            <footer className="app-footer">A moment of stillness. A new perspective.</footer>
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