import React from 'react';
import { Hexs, IChingHexagram } from '../App';
import HexagramDisplay from './HexagramDisplay';
import { Card } from '@/components/ui/card';

interface ReadingViewProps {
    hexs: Hexs;
    originalHex: IChingHexagram;
    transformedHex: IChingHexagram | null;
    error: string | null;
    languages: { zh: boolean; en: boolean; es: boolean };
    setLanguages: React.Dispatch<React.SetStateAction<{ zh: boolean; en: boolean; es: boolean }>>;
}

const ReadingView: React.FC<ReadingViewProps> = ({
    hexs,
    originalHex,
    transformedHex,
    error,
    languages,
    setLanguages,
}) => {
    return (
        <div className="w-full">
            {error ? (
                <p className="text-red-600">{error}</p>
            ) : (
                <Card className="p-4 space-y-6">
                    <HexagramDisplay
                        title="Original Hexagram"
                        hexs={hexs}
                        hexagram={originalHex}
                        languages={languages}
                        setLanguages={setLanguages}
                    />
                    {transformedHex && (
                        <HexagramDisplay
                            title="Transformed Hexagram"
                            hexs={hexs}
                            hexagram={transformedHex}
                            languages={languages}
                            setLanguages={setLanguages}
                        />
                    )}
                </Card>
            )}
        </div>
    );
};

export default ReadingView;