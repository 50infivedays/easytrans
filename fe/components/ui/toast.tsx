'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
    type?: 'success' | 'error' | 'info';
}

const toastIcons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
} as const;

export const Toast: React.FC<ToastProps> = ({
    message,
    isVisible,
    onClose,
    duration = 3000,
    type = 'success',
}) => {
    useEffect(() => {
        if (!isVisible) return;

        const timer = window.setTimeout(onClose, duration);
        return () => window.clearTimeout(timer);
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const Icon = toastIcons[type];

    return (
        <div
            className={`toast toast-portal toast-${type} show`}
            role="status"
            aria-live="polite"
        >
            <Icon className="toast-icon" size={18} strokeWidth={2} aria-hidden="true" />
            <p className="toast-message">{message}</p>
            <button
                type="button"
                className="toast-close"
                onClick={onClose}
                aria-label="Close notification"
            >
                <X size={16} aria-hidden="true" />
            </button>
        </div>
    );
};
