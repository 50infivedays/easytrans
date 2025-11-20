'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
    type?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({
    message,
    isVisible,
    onClose,
    duration = 3000,
    type = 'success'
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return {
                    container: 'bg-white/90 border-green-200 text-green-800',
                    icon: 'text-green-500',
                    closeButton: 'text-green-400 hover:text-green-600',
                    IconComponent: CheckCircle,
                    ring: 'ring-green-500/20'
                };
            case 'error':
                return {
                    container: 'bg-white/90 border-red-200 text-red-800',
                    icon: 'text-red-500',
                    closeButton: 'text-red-400 hover:text-red-600',
                    IconComponent: AlertCircle,
                    ring: 'ring-red-500/20'
                };
            case 'info':
                return {
                    container: 'bg-white/90 border-blue-200 text-blue-800',
                    icon: 'text-blue-500',
                    closeButton: 'text-blue-400 hover:text-blue-600',
                    IconComponent: Info,
                    ring: 'ring-blue-500/20'
                };
        }
    };

    const styles = getToastStyles();
    const IconComponent = styles.IconComponent;

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
            <div className={cn(
                "flex items-center gap-3 border rounded-xl shadow-xl p-4 max-w-md w-auto min-w-[300px] backdrop-blur-md ring-1",
                styles.container,
                styles.ring
            )}>
                <IconComponent className={cn("w-5 h-5 mt-0.5 flex-shrink-0", styles.icon)} />
                <div className="flex-1">
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className={cn("p-1 rounded-full hover:bg-black/5 transition-colors", styles.closeButton)}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
