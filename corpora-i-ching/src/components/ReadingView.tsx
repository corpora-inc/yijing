import React from 'react';
import { Hexs, IChingHexagram } from '../App';
import HexagramDisplay from './HexagramDisplay';
import { Card } from '@/components/ui/card';
// import { useLanguage } from '../context/LanguageContext';

interface ReadingViewProps {
    hexs: Hexs;
    originalHex: IChingHexagram;
    transformedHex: IChingHexagram | null;
    error: string | null;
}

const ReadingView: React.FC<ReadingViewProps> = ({ hexs, originalHex, transformedHex, error }) => {
    // const { languages } = useLanguage();

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
                    />
                    {transformedHex && (
                        <HexagramDisplay
                            title="Transformed Hexagram"
                            hexs={hexs}
                            hexagram={transformedHex}
                        />
                    )}
                </Card>
            )}
        </div>
    );
};

export default ReadingView;