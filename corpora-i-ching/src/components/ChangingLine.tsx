import React from 'react';
import { IChingLine } from '../App';
import { useLanguage } from '../context/LanguageContext';

interface ChangingLineProps {
    line: IChingLine;
}

const ChangingLine: React.FC<ChangingLineProps> = ({ line }) => {
    const { languages } = useLanguage();

    return (
        <div className="text-center">
            <span className="text-lg">{line.line_number}</span> {/* Just the number */}
            {languages.zh && <p>{line.text_zh}</p>}
            {languages.zh && (languages.pinyin || languages.en || languages.es) && line.text_pinyin && <hr className="border-t border-gray-200 opacity-50" />}
            {languages.pinyin && <p>{line.text_pinyin}</p>}
            {languages.pinyin && (languages.en || languages.es) && line.text_en && <hr className="border-t border-gray-200 opacity-50" />}
            {languages.en && <p>{line.text_en}</p>}
            {languages.en && languages.es && line.text_es && <hr className="border-t border-gray-200 opacity-50" />}
            {languages.es && <p>{line.text_es}</p>}
        </div>
    );
};

export default ChangingLine;