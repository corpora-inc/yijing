import React from 'react';
import { IChingLine } from '../App';
import { useLanguage } from '../context/LanguageContext';

interface ChangingLineProps {
    line: IChingLine;
}

const ChangingLine: React.FC<ChangingLineProps> = ({ line }) => {
    const { languages } = useLanguage();

    return (
        <div className="text-center space-y-2 w-full">
            <p className="text-xl m-5">{line.line_number}</p> {/* Just the number */}
            {languages.zh && <p className="text-xl">{line.text_zh}</p>}
            {languages.pinyin && <p>{line.text_pinyin}</p>}
            {languages.en && <p>{line.text_en}</p>}
            {languages.es && <p>{line.text_es}</p>}
            <hr className="border-t border-gray-200 m-8" />
        </div>
    );
};

export default ChangingLine;