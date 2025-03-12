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
    english_name: string;
    changing_lines: IChingLine[];
}

// Language Switcher Component
const LanguageSwitcher: React.FC = () => {
    const { languages, setLanguages } = useLanguage();

    // Count selected languages
    const selectedLanguagesCount = Object.values(languages).filter(Boolean).length;

    // Disable unselecting if only one language is selected
    const isLanguageDisabled = (langKey: keyof typeof languages) => {
        return selectedLanguagesCount === 1 && languages[langKey];
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="fixed bottom-4 right-4 rounded-full w-12 h-12 bg-black text-white hover:bg-gray-800 shadow-lg">
                    <Languages className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Show Languages</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Checkbox
                        checked={languages.zh}
                        onCheckedChange={(checked) => !isLanguageDisabled('zh') && setLanguages({ ...languages, zh: !!checked })}
                        className="mr-2"
                        disabled={isLanguageDisabled('zh')}
                    />
                    Chinese (ZH)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Checkbox
                        checked={languages.en}
                        onCheckedChange={(checked) => !isLanguageDisabled('en') && setLanguages({ ...languages, en: !!checked })}
                        className="mr-2"
                        disabled={isLanguageDisabled('en')}
                    />
                    English (EN)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Checkbox
                        checked={languages.es}
                        onCheckedChange={(checked) => !isLanguageDisabled('es') && setLanguages({ ...languages, es: !!checked })}
                        className="mr-2"
                        disabled={isLanguageDisabled('es')}
                    />
                    Spanish (ES)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const AppContent: React.FC = () => {
    const [mode, setMode] = useState<'consultation' | 'browse'>('consultation');
    const [hasReading, setHasReading] = useState(false);
    const [hexs, setHexs] = useState<Hexs | null>(null);
    const [originalHex, setOriginalHex] = useState<IChingHexagram | null>(null);
    const [transformedHex, setTransformedHex] = useState<IChingHexagram | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    const handleTabChange = (value: string) => {
        setMode(value as 'consultation' | 'browse');
        if (value === 'consultation') {
            handleResetReading();
            handleNewReading();
        }
    };

    return (
        <div className="flex flex-col flex-1 h-screen">
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
                            <LanguageSwitcher />
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