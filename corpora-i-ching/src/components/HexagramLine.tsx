import React from 'react';

interface HexagramLineProps {
    digit: string; // 6, 7, 8, or 9 (display state)
    isChanging: boolean; // Whether this line is changing
    originalDigit: string; // Original digit from consultation_code (6, 7, 8, or 9)
}

const HexagramLine: React.FC<HexagramLineProps> = ({ digit, isChanging, originalDigit }) => {
    const isBroken = digit === '6' || digit === '8'; // Yin lines (broken) based on display digit

    return (
        <div className="flex items-center justify-center mb-2 relative">
            {/* Line Display */}
            <div className="relative flex items-center justify-center w-44 z-0">
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
                    <div className="absolute top-[6px] transform -translate-y-1/2 flex items-center justify-center z-10">
                        {originalDigit === '6' ? (
                            // Old Yin (O) - centered, black background, white center, white border
                            <div className="h-5 w-5 bg-black border-1 border-white rounded-full flex items-center justify-center">
                                <div className="h-4 w-4 bg-white rounded-full" />
                            </div>
                        ) : (
                            // Old Yang (X) - centered, black background, white X, white border
                            <div className="h-5 w-5 bg-black border-1 border-white rounded-full flex items-center justify-center">
                                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HexagramLine;