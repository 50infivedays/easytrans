'use client';

import React, { useState, useCallback } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Dialog } from './dialog';
import { Camera, CameraOff, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatMessage, translations } from '@/i18n/translations';

interface QRScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (result: string) => void;
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface DetectedCode {
    rawValue: string;
}

function getErrorName(error: unknown): string | undefined {
    if (error instanceof DOMException || error instanceof Error) {
        return error.name;
    }
    return undefined;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

export const QRScanner: React.FC<QRScannerProps> = ({
    isOpen,
    onClose,
    onScan,
    onShowToast,
}) => {
    const { language } = useLanguage();
    const t = translations[language]?.qrScanner ?? translations.en.qrScanner;

    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const isMobile = typeof window !== 'undefined' && typeof navigator !== 'undefined'
        ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        : false;

    const handleScan = useCallback((detectedCodes: DetectedCode[]) => {
        if (detectedCodes.length > 0) {
            const result = detectedCodes[0].rawValue;

            if (onShowToast) {
                const toast = translations[language]?.connectToPeer.scanSuccessToast
                    ?? translations.en.connectToPeer.scanSuccessToast;
                onShowToast(toast, 'success');
            }

            onScan(result);
            onClose();
        }
    }, [onScan, onClose, onShowToast, language]);

    const handleError = useCallback((scanError: unknown) => {
        const name = getErrorName(scanError);
        if (name === 'NotAllowedError') {
            setError(t.cameraDenied);
            setHasPermission(false);
        } else if (name === 'NotFoundError') {
            setError(t.cameraNotFound);
            setHasPermission(false);
        } else {
            setError(t.cameraFailed);
            setHasPermission(false);
        }
    }, [t.cameraDenied, t.cameraFailed, t.cameraNotFound]);

    const handleStartScan = useCallback(async () => {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                setError(t.browserNotSupported);
                setHasPermission(false);
                return;
            }

            if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                setError(isMobile ? t.httpsRequiredMobile : t.httpsRequired);
                setHasPermission(false);
                return;
            }

            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setHasPermission(true);
            setIsScanning(true);
            setError(null);
            stream.getTracks().forEach((track) => track.stop());
        } catch (err: unknown) {
            const name = getErrorName(err);
            const message = getErrorMessage(err);

            if (name === 'NotAllowedError') {
                setError(t.cameraDenied);
            } else if (name === 'NotFoundError') {
                setError(t.cameraNotFound);
            } else if (name === 'NotSupportedError') {
                setError(t.deviceNotSupported);
            } else if (name === 'NotReadableError') {
                setError(t.cameraInUse);
            } else {
                setError(formatMessage(t.cameraError, { message: message || '—' }));
            }
            setHasPermission(false);
        }
    }, [isMobile, t]);

    const handleStopScan = useCallback(() => {
        setIsScanning(false);
    }, []);

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={t.title}
            description={t.description}
            showActions={false}
            panelClassName="dialog-panel-scanner"
        >
            <div className="scanner-body">
                {error && (
                    <div className="scanner-alert scanner-alert-error" role="alert">
                        {error}
                    </div>
                )}

                {hasPermission === false && !error && (
                    <div className="scanner-alert scanner-alert-warn" role="status">
                        {isMobile ? t.permissionHintMobile : t.permissionHint}
                    </div>
                )}

                <div className="scanner-viewport">
                    <Scanner
                        onScan={handleScan}
                        onError={handleError}
                        constraints={{
                            facingMode: 'environment',
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                        }}
                        formats={['qr_code']}
                        paused={!isScanning}
                    />

                    {isScanning && (
                        <div className="scanner-frame" aria-hidden="true">
                            <div className="scanner-frame-box">
                                <span className="scanner-frame-corner scanner-frame-corner-tl" />
                                <span className="scanner-frame-corner scanner-frame-corner-tr" />
                                <span className="scanner-frame-corner scanner-frame-corner-bl" />
                                <span className="scanner-frame-corner scanner-frame-corner-br" />
                            </div>
                        </div>
                    )}

                    {!isScanning && (
                        <div className="scanner-idle-overlay">
                            <div className="scanner-idle-inner">
                                <CameraOff size={40} strokeWidth={1.5} aria-hidden="true" />
                                <p>{t.clickToStart}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="scanner-actions">
                    {!isScanning ? (
                        <button type="button" className="btn btn-primary" onClick={handleStartScan}>
                            <Camera size={16} aria-hidden="true" />
                            {hasPermission === false ? t.requestPermission : t.startScan}
                        </button>
                    ) : (
                        <button type="button" className="btn btn-ghost" onClick={handleStopScan}>
                            <CameraOff size={16} aria-hidden="true" />
                            {t.stopScan}
                        </button>
                    )}
                    <button type="button" className="btn btn-ghost" onClick={onClose}>
                        <X size={16} aria-hidden="true" />
                        {t.close}
                    </button>
                </div>
            </div>
        </Dialog>
    );
};
