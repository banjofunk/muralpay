import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
    image: string;
    name: string;
    onClose: () => void;
}

export default function ImageModal({ image, name, onClose }: ImageModalProps) {
    // Close modal on ESC key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
                aria-label="Close modal"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Image container - clicking on it doesn't close the modal */}
            <div
                className="relative max-w-5xl max-h-[90vh] animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={image}
                    alt={name}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-lg">
                    <p className="text-white text-lg font-semibold text-center">{name}</p>
                </div>
            </div>
        </div>
    );
}
