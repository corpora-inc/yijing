import React, { useState } from 'react';
import { Hexs, IChingHexagram } from '../App';
import ChangingLine from './ChangingLine';
import HexagramLine from './HexagramLine';
import { CardContent } from '@/components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';

interface HexagramDisplayProps {
    hexs: Hexs;
    hexagram: IChingHexagram;
    isOriginal: boolean;
}

const HexagramDisplay: React.FC<HexagramDisplayProps> = ({ hexs, hexagram, isOriginal }) => {
    const { languages } = useLanguage();
    const showAnyLanguage = languages.zh || languages.en || languages.es || languages.pinyin;

    // State to toggle between showing all lines or only changing lines
    const [showAllLines, setShowAllLines] = useState(false);

    // Get the original consultation code (bottom to top)
    const originalDigits = hexs.consultation_code.split('');

    // For the transformed hexagram, map to the transformed state
    const transformedDigits = hexs.transformed_binary
        ? hexs.transformed_binary.split('').map((_bit, idx) => {
            const origDigit = hexs.consultation_code[idx];
            if (origDigit === '6') return '7'; // Old Yin → Young Yang
            if (origDigit === '9') return '8'; // Old Yang → Young Yin
            return origDigit; // 7 or 8 (unchanged)
        })
        : [];

    // Use transformed digits for display, original for changing detection
    const displayDigits = isOriginal ? originalDigits : transformedDigits;
    const isChangingArray = originalDigits.map(digit => digit === '6' || digit === '9'); // Always based on original
    // console.log('HexagramDisplay', { displayDigits, isChangingArray });

    // Reverse for display (top line first)
    const displayLines = displayDigits.slice().reverse();
    const displayChanging = isChangingArray.slice().reverse();

    // Filter changing lines based on toggle state
    const visibleChangingLines = showAllLines
        ? hexagram.changing_lines // Show all lines
        : hexagram.changing_lines.filter((_, idx) => isChangingArray[idx]); // Show only changing lines

    return (
        <CardContent className="space-y-4 flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-2">{hexagram.number}</span> {/* Subtle hex number */}
            <div className="flex flex-col items-center">
                {displayLines.map((digit, idx) => (
                    <HexagramLine
                        key={idx}
                        digit={digit}
                        isChanging={displayChanging[idx]}
                        originalDigit={originalDigits[originalDigits.length - 1 - idx]}
                    />
                ))}
            </div>
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-bold text-gray-800">{hexagram.name_zh}</h1>
                <p className="text-xl italic text-gray-600">({hexagram.name_pinyin})</p>
                {languages.en && <p className="text-lg">{hexagram.name_en}</p>}
                {languages.es && <p className="text-lg">{hexagram.name_es}</p>}
                <hr className="border-t border-gray-200 mt-5" />
            </div>
            {showAnyLanguage && (
                <div className="text-center space-y-4 w-full">
                    {languages.zh && hexagram.judgment_zh && (
                        <>
                            <p className="text-xl">{hexagram.judgment_zh}</p>
                        </>
                    )}
                    {languages.pinyin && hexagram.judgment_pinyin && (
                        <>
                            <p>{hexagram.judgment_pinyin}</p>
                        </>
                    )}
                    {languages.en && hexagram.judgment_en && (
                        <>
                            <p>{hexagram.judgment_en}</p>
                        </>
                    )}
                    {languages.es && hexagram.judgment_es && <p>{hexagram.judgment_es}</p>}
                    <hr className="border-t border-gray-200 mt-5" />
                </div>
            )}
            {isOriginal && hexagram.changing_lines.length > 0 && showAnyLanguage && (
                <div className="w-full">
                    {/* Toggle Button */}
                    <div className="flex justify-center mb-8">
                        <Button
                            onClick={() => setShowAllLines(!showAllLines)}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg px-4 py-2 text-sm shadow-sm transition-colors duration-200"
                        >
                            {showAllLines ? 'Show Changing' : 'Show All Lines'}
                        </Button>
                    </div>
                    {/* Changing Lines */}
                    <div>
                        {visibleChangingLines.map((line) => (
                            <ChangingLine key={line.line_number} line={line} />
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
    );
};

export default HexagramDisplay;