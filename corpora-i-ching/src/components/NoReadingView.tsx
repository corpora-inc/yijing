import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import shadcn's Input component
import { useLanguage } from '../context/LanguageContext';

interface NoReadingViewProps {
    onNewReading: (title: string) => void;
}

const NoReadingView: React.FC<NoReadingViewProps> = ({ onNewReading }) => {
    const { languages } = useLanguage();
    const [title, setTitle] = useState('');

    const handleNewReadingWithTitle = () => {
        onNewReading(title || 'Untitled Reading');
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto text-center">
            <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                    languages.en
                        ? 'Enter question...'
                        : languages.zh
                            ? '输入标题或问题...'
                            : languages.pinyin
                                ? 'Shūrù biāotí huò wèntí...'
                                : languages.es
                                    ? 'Ingrese título o pregunta...'
                                    : 'Enter title or question...'
                }
                className="mb-4 w-full"
            />
            {languages.zh && (
                <p className="mb-2 text-base text-gray-600 font-serif">
                    专注于你的问题，然后点击下方咨询易经。
                </p>
            )}
            {languages.pinyin && (
                <p className="mb-2 text-base text-gray-600 font-serif">
                    Zhuānzhù yú nǐ de wèntí, ránhòu diǎnjī xiàfāng zīxún yìjīng.
                </p>
            )}
            {languages.en && (
                <p className="mb-2 text-base text-gray-600 font-serif">
                    Concentrate on your question and click below to consult the I Ching.
                </p>
            )}
            {languages.es && (
                <p className="mb-2 text-base text-gray-600 font-serif">
                    Concéntrate en tu pregunta y haz clic abajo para consultar el I Ching.
                </p>
            )}
            <hr className="my-4" />
            <Button onClick={handleNewReadingWithTitle} className="w-full max-w-full flex flex-col items-center">
                <div className="flex flex-col items-center">
                    {languages.zh && <span className="break-words">新咨询</span>}
                    {languages.pinyin && <span className="break-words">Xīn zīxún</span>}
                    {languages.en && <span className="break-words">New Reading</span>}
                    {languages.es && <span className="break-words">Nueva Lectura</span>}
                </div>
            </Button>
        </div>
    );
};

export default NoReadingView;