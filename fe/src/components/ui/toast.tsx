import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

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
                    container: 'bg-green-50 border-green-200',
                    icon: 'text-green-500',
                    text: 'text-green-800',
                    closeButton: 'text-green-400 hover:text-green-600',
                    IconComponent: CheckCircle
                };
            case 'error':
                return {
                    container: 'bg-red-50 border-red-200',
                    icon: 'text-red-500',
                    text: 'text-red-800',
                    closeButton: 'text-red-400 hover:text-red-600',
                    IconComponent: AlertCircle
                };
            case 'info':
                return {
                    container: 'bg-blue-50 border-blue-200',
                    icon: 'text-blue-500',
                    text: 'text-blue-800',
                    closeButton: 'text-blue-400 hover:text-blue-600',
                    IconComponent: Info
                };
            default:
                return {
                    container: 'bg-green-50 border-green-200',
                    icon: 'text-green-500',
                    text: 'text-green-800',
                    closeButton: 'text-green-400 hover:text-green-600',
                    IconComponent: CheckCircle
                };
        }
    };

    const styles = getToastStyles();
    const IconComponent = styles.IconComponent;

    return (
        <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
            <div className={`border rounded-lg shadow-lg p-4 max-w-sm ${styles.container}`}>
                <div className="flex items-start gap-3">
                    <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.icon}`} />
                    <div className="flex-1">
                        <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`transition-colors ${styles.closeButton}`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}; 