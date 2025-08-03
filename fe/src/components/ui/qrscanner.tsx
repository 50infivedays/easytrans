import React, { useState, useCallback } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from './button';
import { Dialog } from './dialog';
import { X, Camera, CameraOff } from 'lucide-react';

interface QRScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (result: string) => void;
    title?: string;
    description?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
    isOpen,
    onClose,
    onScan,
    title = '扫描二维码',
    description = '将二维码对准摄像头进行扫描'
}) => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleScan = useCallback((detectedCodes: any[]) => {
        if (detectedCodes.length > 0) {
            const result = detectedCodes[0].rawValue;
            console.log('QR Code scanned:', result);
            onScan(result);
            onClose();
        }
    }, [onScan, onClose]);

    const handleError = useCallback((error: any) => {
        console.error('QR Scanner error:', error);
        setError('摄像头访问失败，请检查权限设置');
    }, []);

    const handleStartScan = useCallback(() => {
        setIsScanning(true);
        setError(null);
    }, []);

    const handleStopScan = useCallback(() => {
        setIsScanning(false);
    }, []);

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            showActions={false}
        >
            <div className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <div className="relative">
                    {isScanning ? (
                        <div className="relative">
                            <Scanner
                                onScan={handleScan}
                                onError={handleError}
                                constraints={{
                                    facingMode: 'environment'
                                }}
                                formats={['qr_code']}
                            />
                            <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-lg pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-48 h-48 border-2 border-blue-500 rounded-lg">
                                        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-blue-500"></div>
                                        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-blue-500"></div>
                                        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-blue-500"></div>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-blue-500"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">点击开始扫描</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 justify-center">
                    {!isScanning ? (
                        <Button onClick={handleStartScan} className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            开始扫描
                        </Button>
                    ) : (
                        <Button onClick={handleStopScan} variant="outline" className="flex items-center gap-2">
                            <CameraOff className="w-4 h-4" />
                            停止扫描
                        </Button>
                    )}
                    <Button onClick={onClose} variant="outline" className="flex items-center gap-2">
                        <X className="w-4 h-4" />
                        关闭
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}; 