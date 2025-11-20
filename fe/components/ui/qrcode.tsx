'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
    value: string;
    size?: number;
    className?: string;
}

export const QRCodeComponent: React.FC<QRCodeProps> = ({
    value,
    size = 128,
    className = ''
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && value) {
            QRCode.toCanvas(canvasRef.current, value, {
                width: size,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }).catch((err) => {
                console.error('Error generating QR code:', err);
            });
        }
    }, [value, size]);

    if (!value) {
        return (
            <div
                className={`bg-gray-100 flex items-center justify-center ${className}`}
                style={{ width: size, height: size }}
            >
                <span className="text-gray-400 text-xs">等待UID...</span>
            </div>
        );
    }

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{ width: size, height: size }}
        />
    );
}; 