import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import shadcn's Input component
import { useLanguage } from '../context/LanguageContext';

interface NoReadingViewProps {
    onNewReading: (title: string) => void;
    isCasting: boolean;
}

const NoReadingView: React.FC<NoReadingViewProps> = ({ onNewReading, isCasting }) => {
    const { languages } = useLanguage();
    const [title, setTitle] = useState('');

    const handleNewReadingWithTitle = () => {
        onNewReading(title || 'Untitled Reading');
    };

    return (
        <section className="consultation-card">
            <div className="oracle-symbol" aria-hidden="true"><i /><i /><i className="broken" /><i /><i className="broken" /><i className="broken" /></div>
            <p className="eyebrow">AN ANCIENT PRACTICE, A PRESENT MOMENT</p>
            <h2 className="consultation-title">Make space<br />for an answer.</h2>
            <label htmlFor="question" className="question-label">What is on your mind?</label>
            <Input
                id="question"
                type="text"
                autoComplete="off"
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
                className="question-input"
            />
            {languages.zh && (
                <p className="mb-2 text-gray-600 font-serif text-xl">
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
            <Button
                onClick={handleNewReadingWithTitle}
                disabled={isCasting}
                aria-busy={isCasting}
                className="cast-button"
            >
                <div className="flex flex-col items-center gap-1">
                    {languages.zh && <span className="break-words text-xl">新咨询</span>}
                    {languages.pinyin && <span className="break-words text-base">Xīn zīxún</span>}
                    {languages.en && <span className="break-words text-base">New Reading</span>}
                    {languages.es && <span className="break-words text-base">Nueva Lectura</span>}
                </div>
            </Button>
            <p className="privacy-note">Private by nature. Your readings stay on this device.</p>
        </section>
    );
};

export default NoReadingView;