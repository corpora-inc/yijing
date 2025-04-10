// components/InterpretationModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogOverlay } from '@/components/ui/dialog';
import { Channel, invoke } from '@tauri-apps/api/core';

interface InterpretationModalProps {
    isOpen: boolean;
    onClose: () => void;
    text: string | null;
    attribution: string | null;
}

const InterpretationModal: React.FC<InterpretationModalProps> = ({ isOpen, onClose, text, attribution }) => {
    const [streamedText, setStreamedText] = useState<string[]>([]);

    const handleGenerate = async () => {
        setStreamedText([]); // Clear previous text

        // Create a new Channel for streaming
        const channel = new Channel<string>();
        channel.onmessage = (msg: string) => {
            setStreamedText((prev) => [...prev, msg]);
        };

        try {
            // Invoke the stream_llm command with the channel
            await invoke('stream_llm', {
                prompt: "Provide an I Ching reading interpretation.",
                channel,
            });
        } catch (error) {
            console.error("Failed to stream LLM:", error);
        }
    };

    // Reset streamed text when the modal closes
    useEffect(() => {
        if (!isOpen) {
            setStreamedText([]);
        }
    }, [isOpen]);

    return createPortal(
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay
                className="fixed inset-0 top-0 left-0 bg-black/50 z-50 w-screen h-screen min-w-[100vw] min-h-[100vh]"
            />
            <DialogContent
                className="w-full bg-white shadow-xl border border-gray-200
                           max-w-[100vw] sm:max-w-[90vw] md:max-w-[60rem]
                           max-h-[100vh] sm:max-h-[90vh]
                           h-[100vh] sm:h-auto
                           top-0 sm:top-[50%]
                           translate-y-0 sm:translate-y-[-50%]
                           rounded-none sm:rounded-lg
                           m-0 sm:m-auto
                           flex flex-col"
            >
                <DialogHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Consultation Interpretation
                    </DialogTitle>
                    <DialogClose className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors">
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {text ? (
                        <div className="max-w-[60rem] mx-auto">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{text}</p>
                            {attribution && (
                                <p className="text-sm text-gray-500 italic">— {attribution}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">No interpretation available.</p>
                    )}
                    <div className="max-w-[60rem] mx-auto">
                        <Button
                            onClick={handleGenerate}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors mt-4"
                        >
                            Generate LLM Interpretation
                        </Button>
                        <div className="mt-4">
                            {streamedText.map((chunk, index) => (
                                <span key={index}>{chunk}</span>
                            ))}
                        </div>
                    </div>
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