'use client';

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
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
    language?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
    isOpen,
    onClose,
    onScan,
    title = '扫描二维码',
    description = '将二维码对准摄像头进行扫描',
    onShowToast,
    language = 'zh'
}) => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    // 检测是否为移动设备（只在客户端检查）
    const isMobile = typeof window !== 'undefined' && typeof navigator !== 'undefined' 
        ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        : false;

    const handleScan = useCallback((detectedCodes: any[]) => {
        if (detectedCodes.length > 0) {
            const result = detectedCodes[0].rawValue;
            console.log('QR Code scanned:', result);
            
            // 显示扫描成功toast
            if (onShowToast) {
                const successMessage = language === 'zh' ? '二维码扫描成功！' : 'QR code scanned successfully!';
                onShowToast(successMessage, 'success');
            }
            
            onScan(result);
            onClose();
        }
    }, [onScan, onClose, onShowToast, language]);

    const handleError = useCallback((error: any) => {
        console.error('QR Scanner error:', error);
        if (error.name === 'NotAllowedError') {
            setError('摄像头权限被拒绝，请允许访问摄像头');
            setHasPermission(false);
        } else if (error.name === 'NotFoundError') {
            setError('未找到摄像头设备');
            setHasPermission(false);
        } else {
            setError('摄像头访问失败，请检查权限设置');
            setHasPermission(false);
        }
    }, []);

    const handleStartScan = useCallback(async () => {
        try {
            // 检查是否支持getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError('您的浏览器不支持摄像头访问');
                setHasPermission(false);
                return;
            }

            // 检查是否在HTTPS环境下（移动端要求）
            if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                setError(isMobile ?
                    '移动端需要HTTPS环境才能访问摄像头，请使用HTTPS链接访问' :
                    '移动端需要HTTPS环境才能访问摄像头'
                );
                setHasPermission(false);
                return;
            }

            // 移动端可能需要更具体的约束条件
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            console.log('Requesting camera permission with constraints:', constraints);
            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            console.log('Camera permission granted, stream tracks:', stream.getTracks().length);
            setHasPermission(true);
            setIsScanning(true);
            setError(null);

            // 立即停止流，因为我们只是测试权限
            stream.getTracks().forEach(track => {
                track.stop();
                console.log('Stopped track:', track.kind);
            });
        } catch (err: any) {
            console.error('Camera permission error:', err);
            console.error('Error name:', err.name);
            console.error('Error message:', err.message);

            if (err.name === 'NotAllowedError') {
                setError('摄像头权限被拒绝，请允许访问摄像头');
            } else if (err.name === 'NotFoundError') {
                setError('未找到摄像头设备');
            } else if (err.name === 'NotSupportedError') {
                setError('您的设备不支持摄像头访问');
            } else if (err.name === 'NotReadableError') {
                setError('摄像头被其他应用占用');
            } else {
                setError(`摄像头访问失败: ${err.message || '未知错误'}`);
            }
            setHasPermission(false);
        }
    }, [isMobile]);

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

                {hasPermission === false && !error && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-700 text-sm">
                            {isMobile ? '需要摄像头权限才能开始扫描（移动端请确保使用HTTPS）' : '需要摄像头权限才能开始扫描'}
                        </p>
                    </div>
                )}

                <div className="relative">
                    <div className="relative">
                        <Scanner
                            onScan={handleScan}
                            onError={handleError}
                            constraints={{
                                facingMode: 'environment',
                                width: { ideal: 1280 },
                                height: { ideal: 720 }
                            }}
                            formats={['qr_code']}
                            paused={!isScanning}
                        />
                        {isScanning && (
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
                        )}
                        {!isScanning && (
                            <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center">
                                <div className="text-center">
                                    <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">点击开始扫描</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 justify-center">
                    {!isScanning ? (
                        <Button onClick={handleStartScan} className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            {hasPermission === false ? '请求权限' : '开始扫描'}
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