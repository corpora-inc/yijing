import React from 'react';
import { Hexs, IChingHexagram } from '../App';
import ChangingLine from './ChangingLine';
import HexagramLine from './HexagramLine';
import { CardContent } from '@/components/ui/card';
import { useLanguage } from '../context/LanguageContext';

interface HexagramDisplayProps {
    hexs: Hexs;
    hexagram: IChingHexagram;
    isOriginal: boolean; // New prop to distinguish original vs. transformed
}

const HexagramDisplay: React.FC<HexagramDisplayProps> = ({ hexs, hexagram, isOriginal }) => {
    const { languages } = useLanguage();
    const showAnyLanguage = languages.zh || languages.en || languages.es;

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

    // Reverse for display (top line first)
    const displayLines = displayDigits.slice().reverse();
    const displayChanging = isChangingArray.slice().reverse();

    return (
        <CardContent className="space-y-4 flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-2">{hexagram.number}</span> {/* Subtle hex number */}
            <div className="flex flex-col items-center">
                {displayLines.map((digit, idx) => (
                    <HexagramLine
                        key={idx}
                        digit={digit}
                        isChanging={displayChanging[idx]}
                        originalDigit={originalDigits[originalDigits.length - 1 - idx]} // Pass original digit for indicator check
                    />
                ))}
            </div>
            <div className="text-center space-y-2">
                <h1 className="text-5xl font-bold text-gray-800">{hexagram.chinese_name}</h1>
                <p className="text-xl italic text-gray-600">({hexagram.pinyin})</p>
                {languages.en && <p className="text-lg">{hexagram.english_name}</p>}
            </div>
            {showAnyLanguage && (
                <div className="text-center space-y-2 w-full">
                    {languages.zh && hexagram.judgment_zh && (
                        <>
                            <p>{hexagram.judgment_zh}</p>
                            {(languages.en || languages.es) && hexagram.judgment_en && <hr className="border-t border-gray-200 opacity-50" />}
                        </>
                    )}
                    {languages.en && hexagram.judgment_en && (
                        <>
                            <p>{hexagram.judgment_en}</p>
                            {languages.es && hexagram.judgment_es && <hr className="border-t border-gray-200 opacity-50" />}
                        </>
                    )}
                    {languages.es && hexagram.judgment_es && <p>{hexagram.judgment_es}</p>}
                </div>
            )}
            {isOriginal && hexagram.changing_lines.length > 0 && showAnyLanguage && (
                <div className="space-y-2">
                    {hexagram.changing_lines.map((line) => (
                        <ChangingLine key={line.line_number} line={line} />
                    ))}
                </div>
            )}
        </CardContent>
    );
};

export default HexagramDisplay;