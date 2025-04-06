// components/BrowseView.tsx
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { IChingHexagram, IChingLine } from '../App'; // Import interfaces from App
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const BrowseView: React.FC = () => {
    const [hexagrams, setHexagrams] = useState<IChingHexagram[]>([]);
    const [selectedHexagram, setSelectedHexagram] = useState<IChingHexagram | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isHexListCollapsed, setIsHexListCollapsed] = useState(true);
    const { languages } = useLanguage(); // Get the selected languages
    const showAnyLanguage = languages.zh || languages.en || languages.es || languages.pinyin;

    // Fetch all hexagrams when the component mounts
    useEffect(() => {
        const fetchHexagrams = async () => {
            try {
                const allHexagrams = await invoke<IChingHexagram[]>('fetch_all_hexagrams');
                setHexagrams(allHexagrams);
                setLoading(false);
            } catch (err) {
                setError(String(err));
                setLoading(false);
            }
        };
        fetchHexagrams();
    }, []);

    // Traditional matrix data (based on the image provided)
    const matrix = [
        [1, 34, 5, 26, 11, 9, 14, 43],
        [25, 51, 3, 27, 24, 42, 21, 17],
        [6, 40, 29, 4, 7, 59, 64, 47],
        [33, 62, 39, 52, 15, 53, 56, 31],
        [12, 16, 8, 23, 2, 20, 35, 45],
        [44, 32, 48, 18, 46, 57, 50, 28],
        [13, 55, 63, 22, 36, 37, 30, 49],
        [10, 54, 60, 41, 19, 61, 38, 58],
    ];

    // Trigrams for the matrix (top and side labels)
    const trigrams = ['☰', '☳', '☵', '☶', '☷', '☴', '☲', '☱'];

    // Function to render hexagram lines (based on binary)
    const renderHexagramLines = (binary: string) => {
        const lines = binary.split('').reverse(); // Reverse to display top to bottom
        return lines.map((bit, idx) => (
            <div key={idx} className="flex items-center justify-center my-1">
                {bit === '1' ? (
                    <div className="w-12 h-2 bg-black" />
                ) : (
                    <div className="flex space-x-2">
                        <div className="w-5 h-2 bg-black" />
                        <div className="w-5 h-2 bg-black" />
                    </div>
                )}
            </div>
        ));
    };

    // Function to render changing lines (in browse mode, we show all lines)
    const renderChangingLines = (lines: IChingLine[]) => {
        return lines.map((line) => (
            <div key={line.line_number} className="my-4">
                <h4 className="text-lg font-semibold text-center">{line.line_number}</h4>
                {languages.zh && line.text_zh && <p className="text-xl text-center">{line.text_zh}</p>}
                {languages.pinyin && line.text_pinyin && <p className="text-center">{line.text_pinyin}</p>}
                {languages.en && line.text_en && <p className="text-center">{line.text_en}</p>}
                {languages.es && line.text_es && <p className="text-center">{line.text_es}</p>}
            </div>
        ));
    };

    if (loading) {
        return <div className="p-4">Loading hexagrams...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-4 flex flex-col gap-4 h-full">
            {/* Navigation Section (Matrix and List) */}
            <div className="space-y-4">
                {/* Traditional Matrix */}
                <Card>
                    {/* <CardHeader>
                        <CardTitle>Traditional Matrix</CardTitle>
                    </CardHeader> */}
                    <CardContent>
                        <div className="w-full overflow-x-hidden">
                            <table className="table-auto border-collapse w-full">
                                <thead>
                                    <tr>
                                        <th className="p-1 text-center text-xs sm:text-sm"> </th>
                                        {trigrams.map((trigram, index) => (
                                            <th key={index} className="p-1 text-center text-xs sm:text-sm">
                                                {trigram}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {matrix.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            <td className="p-1 text-center text-xs sm:text-sm">{trigrams[rowIndex]}</td>
                                            {row.map((hexNumber, colIndex) => {
                                                const hexagram = hexagrams.find((h) => h.number === hexNumber);
                                                const isSelected = selectedHexagram?.number === hexNumber;
                                                return (
                                                    <td
                                                        key={colIndex}
                                                        className={`p-1 text-center border cursor-pointer hover:bg-gray-200 transition-colors
                              ${isSelected ? 'bg-gray-300' : 'bg-white'}
                              text-xs sm:text-sm min-w-[30px] min-h-[30px]`}
                                                        onClick={() => hexagram && setSelectedHexagram(hexagram)}
                                                    >
                                                        {hexNumber}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* 1-64 Hexagram List (Collapsible) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Hexagram List (1-64)</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsHexListCollapsed(!isHexListCollapsed)}
                            aria-label={isHexListCollapsed ? 'Expand hexagram list' : 'Collapse hexagram list'}
                        >
                            {isHexListCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                        </Button>
                    </CardHeader>
                    {!isHexListCollapsed && (
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {hexagrams
                                    .sort((a, b) => a.number - b.number)
                                    .map((hexagram) => {
                                        const isSelected = selectedHexagram?.number === hexagram.number;
                                        return (
                                            <div
                                                key={hexagram.id}
                                                className={`p-2 border rounded cursor-pointer hover:bg-gray-200 transition-colors
                          ${isSelected ? 'bg-gray-300' : 'bg-white'}`}
                                                onClick={() => setSelectedHexagram(hexagram)}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {hexagram.number}.{' '}
                                                        {languages.en
                                                            ? hexagram.name_en
                                                            : languages.es
                                                                ? hexagram.name_es
                                                                : hexagram.name_en}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {hexagram.name_zh} ({hexagram.name_pinyin})
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>

            {/* Hexagram Display Section */}
            <div className="w-full">
                {selectedHexagram ? (
                    <Card className="h-full">
                        <CardContent className="space-y-4 flex flex-col items-center pt-6">
                            {/* Hexagram Number */}
                            <span className="text-sm text-gray-500 mb-2">{selectedHexagram.number}</span>

                            {/* Hexagram Lines */}
                            <div className="flex flex-col items-center">
                                {renderHexagramLines(selectedHexagram.binary)}
                            </div>

                            {/* Hexagram Name */}
                            <div className="text-center space-y-2">
                                {languages.zh && (
                                    <h1 className="text-5xl font-bold text-gray-800">{selectedHexagram.name_zh}</h1>
                                )}
                                {languages.pinyin && (
                                    <p className="text-xl italic text-gray-600">({selectedHexagram.name_pinyin})</p>
                                )}
                                {languages.en && <p className="text-lg">{selectedHexagram.name_en}</p>}
                                {languages.es && <p className="text-lg">{selectedHexagram.name_es}</p>}
                            </div>

                            {/* Judgment */}
                            {showAnyLanguage && (
                                <div className="text-center space-y-2 w-full">
                                    {languages.zh && selectedHexagram.judgment_zh && (
                                        <p className="text-xl">{selectedHexagram.judgment_zh}</p>
                                    )}
                                    {languages.pinyin && selectedHexagram.judgment_pinyin && (
                                        <p>{selectedHexagram.judgment_pinyin}</p>
                                    )}
                                    {languages.en && selectedHexagram.judgment_en && (
                                        <p>{selectedHexagram.judgment_en}</p>
                                    )}
                                    {languages.es && selectedHexagram.judgment_es && (
                                        <p>{selectedHexagram.judgment_es}</p>
                                    )}
                                    <hr className="border-t border-gray-200 mt-5" />
                                </div>
                            )}

                            {/* Changing Lines (Show All Lines in Browse Mode) */}
                            {showAnyLanguage && selectedHexagram.changing_lines.length > 0 && (
                                <div className="w-full">
                                    {renderChangingLines(selectedHexagram.changing_lines)}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="h-full flex items-center justify-center">
                        <CardContent>
                            <p className="text-gray-500">Select a hexagram to view its details.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default BrowseView;
