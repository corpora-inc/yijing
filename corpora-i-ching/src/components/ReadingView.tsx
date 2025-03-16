import React from 'react';
import HexagramDisplay from './HexagramDisplay';
import { Hexs, IChingHexagram } from '../App';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../context/LanguageContext';

interface ReadingViewProps {
    hexs: Hexs;
    originalHex: IChingHexagram;
    transformedHex: IChingHexagram | null;
    error: string | null;
    onNewConsultation: () => void; // Callback to reset to NoReadingView
}

const ReadingView: React.FC<ReadingViewProps> = ({ hexs, originalHex, transformedHex, error, onNewConsultation }) => {
    const { languages } = useLanguage();

    return (
        <div className="flex flex-col items-center w-full h-full p-4 space-y-6">
            {error && <p className="text-red-500 text-center">{error}</p>}
            <HexagramDisplay hexs={hexs} hexagram={originalHex} isOriginal={true} />
            {transformedHex && <HexagramDisplay hexs={hexs} hexagram={transformedHex} isOriginal={false} />}
            {/* New Consultation Button Below Hexagrams */}
            <Button
                onClick={onNewConsultation}
                className="w-full max-w-full flex flex-col items-center h-auto min-h-10 py-4 bg-black text-white font-semibold rounded-lg shadow-lg border border-blue-400"
            >
                <div className="flex flex-col items-center gap-1">
                    {languages.zh && <span className="break-words text-xl">新咨询</span>}
                    {languages.pinyin && <span className="break-words text-base">Xīn zīxún</span>}
                    {languages.en && <span className="break-words text-base">New Consultation</span>}
                    {languages.es && <span className="break-words text-base">Nueva Consulta</span>}
                </div>
            </Button>
        </div>
    );
};

export default ReadingView;