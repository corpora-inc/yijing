import React from 'react';
import { Button } from '@/components/ui/button';

interface NoReadingViewProps {
    onNewReading: () => void;
}

const NoReadingView: React.FC<NoReadingViewProps> = ({ onNewReading }) => {
    return (
        <div className="text-center">
            <p className="mb-4 text-lg text-gray-700">
                Concentrate on your question and click below to consult the I Ching.
            </p>
            <Button onClick={onNewReading}>
                New Reading
            </Button>
        </div>
    );
};

export default NoReadingView;