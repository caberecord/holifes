'use client';

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface FloatingChatProps {
    position?: 'bottom-left' | 'bottom-right';
    profileImage?: string;
    chatName?: string;
    initialMessage?: string;
    whatsappLink?: string;
    backgroundColor?: string;
    textColor?: string;
}

export const FloatingChat = ({
    position = 'bottom-right',
    profileImage = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    chatName = 'Soporte',
    initialMessage = '¿Cómo podemos ayudarte hoy?',
    whatsappLink = 'https://wa.me/',
    backgroundColor = '#25D366',
    textColor = '#FFFFFF'
}: FloatingChatProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const positionClass = position === 'bottom-left' ? 'left-6' : 'right-6';

    const handleSend = () => {
        if (whatsappLink) {
            window.open(whatsappLink, '_blank');
        }
    };

    return (
        <div className={`fixed bottom-6 ${positionClass} z-50 flex flex-col items-end`}>
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-10 fade-in duration-200">
                    {/* Header */}
                    <div
                        className="p-4 flex items-center gap-3"
                        style={{ backgroundColor: backgroundColor, color: textColor }}
                    >
                        <div className="relative">
                            <img
                                src={profileImage}
                                alt={chatName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">{chatName}</h3>
                            <p className="text-xs opacity-90">En línea</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="ml-auto p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 bg-gray-50 h-64 overflow-y-auto flex flex-col gap-3">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 max-w-[85%]">
                            {initialMessage}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <button
                            onClick={handleSend}
                            className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-transform active:scale-95"
                            style={{ backgroundColor: backgroundColor, color: textColor }}
                        >
                            <span>Iniciar Chat</span>
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 overflow-hidden"
                style={{ backgroundColor: backgroundColor, color: textColor }}
            >
                {isOpen ? (
                    <X size={28} />
                ) : (
                    <img
                        src="/ico_whatsapp.png"
                        alt="WhatsApp"
                        className="w-full h-full object-cover"
                    />
                )}
            </button>
        </div>
    );
};
