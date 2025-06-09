// components/InterpretationModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogOverlay } from '@/components/ui/dialog';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Globe } from 'lucide-react';

interface InterpretationModalProps {
    isOpen: boolean;
    onClose: () => void;
    text: string | null;
    attribution: string | null;
}

const InterpretationModal: React.FC<InterpretationModalProps> = ({ isOpen, onClose, text }) => {
    return createPortal(
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Ensure the overlay covers the entire viewport */}
            <DialogOverlay
                className="fixed inset-0 top-0 left-0 bg-black/80 z-50 w-screen h-screen min-w-[100vw] min-h-[100vh]"
            />
            <DialogContent
                className="w-full bg-white shadow-xl border border-gray-200
                           max-w-[100vw] sm:max-w-[95vw] md:max-w-[60rem] /* Cap width for readability */
                           top-[env(safe-area-inset-top)]
                           translate-y-0
                           rounded-none sm:rounded-lg
                           m-0 sm:m-auto
                           flex flex-col" // Use flexbox to control layout

            >
                <DialogHeader className="border-b border-gray-200 pb-4 px-6 pt-2">
                    <DialogTitle className="text-sm font-semibold text-gray-900">
                        Consultation Interpretation
                    </DialogTitle>
                    <DialogClose className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors">
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
                    {text ? (
                        <div className="max-w-[60rem] mx-auto"> {/* Cap text width for readability */}
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{text}</p>
                            <span className="text-gray-500 text-sm mt-2">
                                <Button
                                    variant="ghost"
                                    size="default"
                                    className="justify-start hover:bg-gray-100 cursor-pointer"
                                    onClick={() => openUrl(`https://encorpora.io`)}
                                >
                                    -
                                    <span>https://encorpora.io</span>
                                    <Globe />
                                </Button>
                            </span>
                        </div>
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