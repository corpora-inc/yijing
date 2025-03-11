import React from 'react';
import { Hexs, IChingHexagram } from '../App';
import ChangingLine from './ChangingLine';
import { CardContent } from '@/components/ui/card';
import { useLanguage } from '../context/LanguageContext';

interface HexagramDisplayProps {
    title: string;
    hexs: Hexs;
    hexagram: IChingHexagram;
}

const HexagramDisplay: React.FC<HexagramDisplayProps> = ({ title, hexs, hexagram }) => {
    const { languages } = useLanguage();
    const lines = title.includes('Original') ? hexs.original : hexs.transformed || [];
    const showAnyLanguage = languages.zh || languages.en || languages.es;

    return (
        <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <pre className="font-mono text-lg mb-2 bg-gray-100 p-2 rounded-md">{lines.join('\n')}</pre>
            <div className="text-center space-y-2">
                <h1 className="text-5xl font-bold text-gray-800">{hexagram.chinese_name}</h1>
                <p className="text-xl italic text-gray-600">({hexagram.pinyin})</p>
                {languages.en && <p className="text-lg">{hexagram.english_name}</p>}
            </div>
            {showAnyLanguage && (
                <>
                    {languages.zh && <p><strong>Judgment (ZH):</strong> {hexagram.judgment_zh}</p>}
                    {languages.en && <p><strong>Judgment (EN):</strong> {hexagram.judgment_en}</p>}
                    {languages.es && <p><strong>Judgment (ES):</strong> {hexagram.judgment_es}</p>}
                </>
            )}
            {hexagram.changing_lines.length > 0 && showAnyLanguage && (
                <div className="space-y-2">
                    <h3 className="text-lg font-medium mt-4">Changing Lines</h3>
                    {hexagram.changing_lines.map((line) => (
                        <ChangingLine key={line.line_number} line={line} />
                    ))}
                </div>
            )}
        </CardContent>
    );
};

export default HexagramDisplay;