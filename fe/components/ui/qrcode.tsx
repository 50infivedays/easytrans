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
                className={`qr-placeholder ${className}`}
                style={{ width: size, height: size }}
            >
                <span>…</span>
            </div>
        );
    }

    return (
        <canvas
            ref={canvasRef}
            className={className}
            width={size}
            height={size}
            style={{ width: size, height: size }}
            aria-hidden
        />
    );
}; 