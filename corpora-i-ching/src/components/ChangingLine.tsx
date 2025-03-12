import React from 'react';
import { IChingLine } from '../App';
import { useLanguage } from '../context/LanguageContext';

interface ChangingLineProps {
    line: IChingLine;
}

const ChangingLine: React.FC<ChangingLineProps> = ({ line }) => {
    const { languages } = useLanguage();

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