import React from 'react';
import { IChingLine } from '../App';

interface ChangingLineProps {
    line: IChingLine;
}

const ChangingLine: React.FC<ChangingLineProps> = ({ line }) => {
    return (
        <div className="space-y-1">
            <p className="font-semibold">Line {line.line_number}</p>
            <p><strong>ZH:</strong> {line.text_zh}</p>
            <p><strong>EN:</strong> {line.text_en}</p>
            <p><strong>ES:</strong> {line.text_es}</p>
        </div>
    );
};

export default ChangingLine;
