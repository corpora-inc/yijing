import React from 'react';
import { Hexs, IChingHexagram } from '../App';
import HexagramDisplay from './HexagramDisplay';

interface ReadingViewProps {
    hexs: Hexs;
    originalHex: IChingHexagram;
    transformedHex: IChingHexagram | null;
    error: string | null;
}

const ReadingView: React.FC<ReadingViewProps> = ({ hexs, originalHex, transformedHex, error }) => {
    return (
        <div className="w-full">
            {error ? (
                <p className="text-red-600">{error}</p>
            ) : (
                <div className="space-y-6">
                    <HexagramDisplay title="Original Hexagram" hexs={hexs} hexagram={originalHex} />
                    {transformedHex && (
                        <HexagramDisplay title="Transformed Hexagram" hexs={hexs} hexagram={transformedHex} />
                    )}
                </div>
            )}
        </div>
    );
};

export default ReadingView;