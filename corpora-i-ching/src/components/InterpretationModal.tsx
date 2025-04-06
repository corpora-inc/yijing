// components/InterpretationModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogOverlay } from '@/components/ui/dialog';

interface InterpretationModalProps {
    isOpen: boolean;
    onClose: () => void;
    text: string | null;
    attribution: string | null;
}

const InterpretationModal: React.FC<InterpretationModalProps> = ({ isOpen, onClose, text, attribution }) => {
    return createPortal(
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Ensure the overlay covers the entire viewport */}
            <DialogOverlay className="fixed inset-0 bg-black/50 z-50 w-screen h-screen" />
            <DialogContent
                className="w-full bg-white shadow-xl border border-gray-200
                           max-w-[100vw] sm:max-w-lg lg:max-w-2xl
                           max-h-[100vh] sm:max-h-[90vh] lg:max-h-[85vh]
                           top-0 sm:top-[50%]
                           translate-y-0 sm:translate-y-[-50%]
                           h-full sm:h-auto
                           rounded-none sm:rounded-lg
                           m-0 sm:m-auto"
            >
                <DialogHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Consultation Interpretation
                    </DialogTitle>
                    <DialogClose className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors">
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>
                <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] sm:max-h-[calc(90vh-140px)] lg:max-h-[calc(85vh-140px)]">
                    {text ? (
                        <>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{text}</p>
                            {attribution && (
                                <p className="text-sm text-gray-500 italic">— {attribution}</p>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500 text-center">No interpretation available.</p>
                    )}
                </div>
                <div className="border-t border-gray-200 p-4">
                    <Button
                        onClick={onClose}
                        className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 rounded-md transition-colors"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>,
        document.body
    );
};

export default InterpretationModal;