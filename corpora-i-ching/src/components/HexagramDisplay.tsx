import React from 'react';
import { Hexs, IChingHexagram } from '../App';
import ChangingLine from './ChangingLine';

interface HexagramDisplayProps {
    title: string;
    hexs: Hexs;
    hexagram: IChingHexagram;
}

const HexagramDisplay: React.FC<HexagramDisplayProps> = ({ title, hexs, hexagram }) => {
    const lines = title.includes('Original') ? hexs.original : hexs.transformed || [];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <pre className="font-mono text-lg mb-2">{lines.join('\n')}</pre>
            <p><strong>Number:</strong> {hexagram.number}</p>
            <p><strong>English Name:</strong> {hexagram.english_name}</p>
            <p><strong>Chinese Name:</strong> {hexagram.chinese_name} ({hexagram.pinyin})</p>
            <p><strong>Judgment (EN):</strong> {hexagram.judgment_en}</p>
            {hexagram.changing_lines.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-lg font-medium mt-4">Changing Lines</h3>
                    {hexagram.changing_lines.map((line) => (
                        <ChangingLine key={line.line_number} line={line} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HexagramDisplay;