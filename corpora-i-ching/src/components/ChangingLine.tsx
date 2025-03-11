import React from 'react';
import { IChingLine } from '../App';

interface ChangingLineProps {
    line: IChingLine;
    languages: { zh: boolean; en: boolean; es: boolean };
}

const ChangingLine: React.FC<ChangingLineProps> = ({ line, languages }) => {
    return (
        <div className="space-y-1">
            <p className="font-semibold">Line {line.line_number}</p>
            {languages.zh && <p><strong>ZH:</strong> {line.text_zh}</p>}
            {languages.en && <p><strong>EN:</strong> {line.text_en}</p>}
            {languages.es && <p><strong>ES:</strong> {line.text_es}</p>}
        </div>
    );
};

export default ChangingLine;