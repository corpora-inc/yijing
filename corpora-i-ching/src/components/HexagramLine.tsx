import React from 'react';

interface HexagramLineProps {
    digit: string; // 6, 7, 8, or 9
    isChanging: boolean; // Explicitly pass whether this line is changing
}

const HexagramLine: React.FC<HexagramLineProps> = ({ digit, isChanging }) => {
    const isBroken = digit === '6' || digit === '8'; // Yin lines (broken)

    return (
        <div className="flex items-center justify-center mb-2">
            {/* Line Display */}
            <div className="relative flex items-center justify-center w-44">
                {isBroken ? (
                    // Broken line (Yin)
                    <>
                        <div className="h-3 w-20 bg-black rounded-none transition-all duration-300" />
                        <div className="h-3 w-4 bg-transparent" />
                        <div className="h-3 w-20 bg-black rounded-none transition-all duration-300" />
                    </>
                ) : (
                    // Solid line (Yang)
                    <div className="h-3 w-44 bg-black rounded-none transition-all duration-300" />
                )}
                {isChanging && (
                    <div className="absolute">
                        {digit === '6' ? (
                            // Old Yin (O) - centered and thick
                            <div className="h-3 w-3 bg-black rounded-full flex items-center justify-center" />
                        ) : (
                            // Old Yang (X) - centered and thick
                            <svg className="h-3 w-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HexagramLine;