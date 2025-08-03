import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ENV } from '../config/environment';
import { ENV_INFO } from '../config/api';

// 调试面板组件 - 仅在开发环境显示
const DebugPanel: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [debugInfo, setDebugInfo] = useState<any>(null);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    const fetchDebugInfo = async () => {
        try {
            const response = await fetch('/debug/users');
            const data = await response.json();
            setDebugInfo(data);
        } catch (error) {
            console.error('Failed to fetch debug info:', error);
            setDebugInfo({ error: 'Failed to fetch debug info' });
        }
    };

    useEffect(() => {
        if (isVisible) {
            fetchDebugInfo();
        }
    }, [isVisible]);

    // 仅在开发环境渲染
    if (!ENV.isDevelopment) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Button
                onClick={toggleVisibility}
                variant="outline"
                size="sm"
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
            >
                🐛 Debug
            </Button>

            {isVisible && (
                <Card className="mt-2 w-80 max-h-96 overflow-y-auto">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Debug Panel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                        <div>
                            <strong>Environment:</strong>
                            <Badge variant="outline" className="ml-2">
                                {ENV.nodeEnv}
                            </Badge>
                        </div>

                        <div>
                            <strong>API Base URL:</strong>
                            <div className="text-gray-600">{ENV_INFO.apiBaseUrl || 'Using proxy'}</div>
                        </div>

                        <div>
                            <strong>WebSocket URL:</strong>
                            <div className="text-gray-600">{ENV_INFO.wsUrl}</div>
                        </div>

                        <div>
                            <strong>Hostname:</strong>
                            <div className="text-gray-600">{window.location.hostname}</div>
                        </div>

                        {debugInfo && (
                            <div>
                                <strong>Connected Users:</strong>
                                <div className="text-gray-600">
                                    {debugInfo.totalUsers || 0} users online
                                </div>
                                {debugInfo.users && debugInfo.users.length > 0 && (
                                    <div className="mt-1">
                                        <div className="text-gray-500">User IDs:</div>
                                        <div className="text-gray-600 text-xs max-h-20 overflow-y-auto">
                                            {debugInfo.users.join(', ')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            onClick={fetchDebugInfo}
                            size="sm"
                            variant="outline"
                            className="w-full"
                        >
                            Refresh Debug Info
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DebugPanel; 