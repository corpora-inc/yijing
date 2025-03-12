import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../context/LanguageContext';

interface NoReadingViewProps {
    onNewReading: (title: string) => void; // Updated to pass the title
}

const NoReadingView: React.FC<NoReadingViewProps> = ({ onNewReading }) => {
    const { languages } = useLanguage();
    const [title, setTitle] = useState(''); // State for the title/question input

    const handleNewReadingWithTitle = () => {
        onNewReading(title || 'Untitled Reading'); // Pass the title to the parent
    };

    return (
        <div className="text-center">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={languages.en ? 'Enter question...' : languages.zh ? '输入标题或问题...' : languages.pinyin ? 'Shūrù biāotí huò wèntí...' : languages.es ? 'Ingrese título o pregunta...' : 'Enter title or question...'}
                className="mb-4 p-2 border rounded w-3/4 max-w-xs text-center"
            />
            <p className="mb-4 text-lg text-gray-700">
                {languages.zh && '专注于你的问题，然后点击下方咨询易经。'}
            </p>
            <p className="mb-4 text-lg text-gray-700">
                {languages.pinyin && 'Zhuānzhù yú nǐ de wèntí, ránhòu diǎnjī xiàfāng zīxún yìjīng.'}
            </p>
            <p className="mb-4 text-lg text-gray-700">
                {languages.en && 'Concentrate on your question and click below to consult the I Ching.'}
            </p>
            <p className="mb-4 text-lg text-gray-700">
                {languages.es && 'Concéntrate en tu pregunta y haz clic abajo para consultar el I Ching.'}
            </p>

            <Button onClick={handleNewReadingWithTitle}>
                {languages.zh && '新咨询 '}
                {languages.pinyin && 'Xīn zīxún '}
                {languages.en && 'New Reading '}
                {languages.es && 'Nueva Lectura'}
            </Button>
        </div>
    );
};

export default NoReadingView;