import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    children?: React.ReactNode;
    showActions?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
    isOpen,
    onClose,
    title,
    description,
    confirmText = '确认',
    cancelText = '取消',
    onConfirm,
    onCancel,
    children,
    showActions = true,
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm?.();
        onClose();
    };

    const handleCancel = () => {
        onCancel?.();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {children}
                        {showActions && (
                            <div className="flex gap-2 justify-end mt-4">
                                <Button variant="outline" onClick={handleCancel}>
                                    {cancelText}
                                </Button>
                                {onConfirm && (
                                    <Button onClick={handleConfirm}>
                                        {confirmText}
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}; 