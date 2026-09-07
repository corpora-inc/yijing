// components/ReadingView.tsx
import React, { useState } from 'react';
import HexagramDisplay from './HexagramDisplay';
import { Hexs, IChingHexagram } from '../App';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../context/LanguageContext';
import InterpretationModal from './InterpretationModal'; // Add this import

interface ReadingViewProps {
    hexs: Hexs;
    originalHex: IChingHexagram;
    transformedHex: IChingHexagram | null;
    error: string | null;
    onNewConsultation: () => void;
    interpretation: { text: string; attribution: string } | null; // Add this prop
}

const ReadingView: React.FC<ReadingViewProps> = ({ hexs, originalHex, transformedHex, error, onNewConsultation, interpretation }) => {
    const { languages } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

    return (
        <div className="reading-view flex flex-col items-center w-full space-y-6">
            {error && <p className="text-red-500 text-center">{error}</p>}
            <HexagramDisplay hexs={hexs} hexagram={originalHex} isOriginal={true} />
            {transformedHex && <HexagramDisplay hexs={hexs} hexagram={transformedHex} isOriginal={false} />}
            {/* Interpretation Button */}
            <Button
                onClick={() => setIsModalOpen(true)}
                className="cast-button secondary-action"
            >
                <div className="flex flex-col items-center gap-1">
                    {languages.zh && <span className="break-words text-xl">查看解釋</span>}
                    {languages.pinyin && <span className="break-words text-base">Chákàn jiěshì</span>}
                    {languages.en && <span className="break-words text-base">View Interpretation</span>}
                    {languages.es && <span className="break-words text-base">Ver Interpretación</span>}
                </div>
            </Button>
            {/* New Consultation Button */}
            <Button
                onClick={onNewConsultation}
                className="cast-button"
            >
                <div className="flex flex-col items-center gap-1">
                    {languages.zh && <span className="break-words text-xl">新咨询</span>}
                    {languages.pinyin && <span className="break-words text-base">Xīn zīxún</span>}
                    {languages.en && <span className="break-words text-base">New Consultation</span>}
                    {languages.es && <span className="break-words text-base">Nueva Consulta</span>}
                </div>
            </Button>
            {/* Interpretation Modal */}
            <InterpretationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                text={interpretation?.text || null}
                attribution={interpretation?.attribution || null}
            />
        </div>
    );
};

export default ReadingView;