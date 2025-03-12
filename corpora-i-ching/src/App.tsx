import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import NoReadingView from './components/NoReadingView';
import ReadingView from './components/ReadingView';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Languages } from 'lucide-react';

// Define interfaces
export interface IChingLine {
    line_number: number;
    text_zh: string;
    text_en: string;
    text_es: string;
}

export interface Hexs {
    consultation_code: string;       // 6-digit code (666666 to 999999)
    transformed_code: string | null; // Optional transformed code
    binary: string;                 // 6-char binary (0s and 1s)
    transformed_binary: string | null; // Optional transformed binary
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
    english_name: string;
    changing_lines: IChingLine[];
}

const AppContent: React.FC = () => {
    const [mode, setMode] = useState<'consultation' | 'browse'>('consultation');
    const [hasReading, setHasReading] = useState(false);
    const [hexs, setHexs] = useState<Hexs | null>(null);
    const [originalHex, setOriginalHex] = useState<IChingHexagram | null>(null);
    const [transformedHex, setTransformedHex] = useState<IChingHexagram | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { languages, setLanguages } = useLanguage();

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

    return (
        <div className="flex flex-col flex-1 h-screen">
            {/* Navigation Tabs */}
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'consultation' | 'browse')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="consultation">Consultation</TabsTrigger>
                    <TabsTrigger value="browse">Browse</TabsTrigger>
                </TabsList>
                <div className="p-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Languages className="h-4 w-4 mr-2" />
                                Languages
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Show Languages</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Checkbox
                                    checked={languages.zh}
                                    onCheckedChange={(checked) => setLanguages({ ...languages, zh: !!checked })}
                                    className="mr-2"
                                />
                                Chinese (ZH)
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Checkbox
                                    checked={languages.en}
                                    onCheckedChange={(checked) => setLanguages({ ...languages, en: !!checked })}
                                    className="mr-2"
                                />
                                English (EN)
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Checkbox
                                    checked={languages.es}
                                    onCheckedChange={(checked) => setLanguages({ ...languages, es: !!checked })}
                                    className="mr-2"
                                />
                                Spanish (ES)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
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
                            <Button
                                onClick={handleResetReading}
                                className="fixed bottom-4 right-4 rounded-full w-12 h-12 bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                            >
                                +
                            </Button>
                        </div>
                    )
                ) : (
                    <div className="text-center">
                        <p className="mt-4 text-gray-700">Browse mode coming soon!</p>
                    </div>
                )}
            </div>
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