import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../context/LanguageContext';

interface NoReadingViewProps {
    onNewReading: () => void;
}

const NoReadingView: React.FC<NoReadingViewProps> = ({ onNewReading }) => {
    const { languages } = useLanguage();

    return (
        <div className="text-center">
            <p className="mb-4 text-lg text-gray-700">
                {languages.zh && '专注于你的问题，然后点击下方咨询易经。'}
            </p>
            <p className="mb-4 text-lg text-gray-700">
                {languages.en && 'Concentrate on your question and click below to consult the I Ching.'}
            </p>
            <p className="mb-4 text-lg text-gray-700">
                {languages.es && 'Concéntrate en tu pregunta y haz clic abajo para consultar el I Ching.'}
            </p>

            <Button onClick={onNewReading}>
                {languages.zh && '新咨询'}
                {languages.en && 'New Reading'}
                {languages.es && 'Nueva Lectura'}
            </Button>
        </div>
    );
};

export default NoReadingView;