import React from 'react';
import { Hexs, IChingHexagram } from '../App';
import ChangingLine from './ChangingLine';
import HexagramLine from './HexagramLine';
import { CardContent } from '@/components/ui/card';
import { useLanguage } from '../context/LanguageContext';

interface HexagramDisplayProps {
    title: string;
    hexs: Hexs;
    hexagram: IChingHexagram;
}

const HexagramDisplay: React.FC<HexagramDisplayProps> = ({ title, hexs, hexagram }) => {
    const { languages } = useLanguage();
    const showAnyLanguage = languages.zh || languages.en || languages.es;

    // Get the original consultation code (bottom to top)
    const originalDigits = hexs.consultation_code.split('');

    // For the transformed hexagram, map to the transformed state without changing indicators
    const transformedDigits = hexs.transformed_binary
        ? hexs.transformed_binary.split('').map((_bit, idx) => {
            const origDigit = hexs.consultation_code[idx];
            if (origDigit === '6') return '7'; // Old Yin → Young Yang
            if (origDigit === '9') return '8'; // Old Yang → Young Yin
            return origDigit; // 7 or 8 (unchanged)
        })
        : [];

    // Determine which digits to use and track changing lines
    const digits = title.includes('Original') ? originalDigits : transformedDigits;
    const isChangingArray = title.includes('Original')
        ? originalDigits.map(digit => digit === '6' || digit === '9')
        : Array(digits.length).fill(false); // No changing indicators in transformed

    // Reverse for display (top line first)
    const displayLines = digits.slice().reverse();
    const displayChanging = isChangingArray.slice().reverse();

    return (
        <CardContent className="space-y-4 flex flex-col items-center">
            <h2 className="text-xl font-semibold text-center">{title}</h2>
            <div className="flex flex-col items-center">
                {displayLines.map((digit, idx) => (
                    <HexagramLine
                        key={idx}
                        digit={digit}
                        isChanging={displayChanging[idx]}
                    />
                ))}
            </div>
            <div className="text-center space-y-2">
                <h1 className="text-5xl font-bold text-gray-800">{hexagram.chinese_name}</h1>
                <p className="text-xl italic text-gray-600">({hexagram.pinyin})</p>
                {languages.en && <p className="text-lg">{hexagram.english_name}</p>}
            </div>
            {showAnyLanguage && (
                <div className="space-y-2 w-full">
                    {languages.zh && <p className="text-center">{hexagram.judgment_zh}</p>}
                    {languages.zh && (languages.en || languages.es) && <hr className="border-t border-gray-200 opacity-50" />}
                    {languages.en && <p className="text-center">{hexagram.judgment_en}</p>}
                    {languages.en && languages.es && <hr className="border-t border-gray-200 opacity-50" />}
                    {languages.es && <p className="text-center">{hexagram.judgment_es}</p>}
                </div>
            )}
            {title.includes('Original') && hexagram.changing_lines.length > 0 && showAnyLanguage && (
                <div className="space-y-2 w-full">
                    <h3 className="text-lg font-medium text-center mt-4">Changing Lines</h3>
                    {hexagram.changing_lines.map((line) => (
                        <ChangingLine key={line.line_number} line={line} />
                    ))}
                </div>
            )}
        </CardContent>
    );
};

export default HexagramDisplay;