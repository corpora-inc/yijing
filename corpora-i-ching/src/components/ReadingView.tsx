import React from 'react';
import HexagramDisplay from './HexagramDisplay';
import { Hexs, IChingHexagram } from '../App';

interface ReadingViewProps {
    hexs: Hexs;
    originalHex: IChingHexagram;
    transformedHex: IChingHexagram | null;
    error: string | null;
}

const ReadingView: React.FC<ReadingViewProps> = ({ hexs, originalHex, transformedHex, error }) => {
    return (
        <div className="flex flex-col items-center w-full h-full p-4 space-y-6">
            {error && <p className="text-red-500 text-center">{error}</p>}
            <HexagramDisplay hexs={hexs} hexagram={originalHex} isOriginal={true} />
            {transformedHex && <HexagramDisplay hexs={hexs} hexagram={transformedHex} isOriginal={false} />}
        </div>
    );
};

export default ReadingView;