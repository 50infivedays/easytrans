'use client';

import React, { useState } from 'react';
import { ENV } from '../config/environment';
import { ENV_INFO } from '../config/api';

interface DebugInfo {
  totalUsers?: number;
  users?: string[];
  error?: string;
}

const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/debug/users');
      const data = (await response.json()) as DebugInfo;
      setDebugInfo(data);
    } catch (error) {
      console.error('Failed to fetch debug info:', error);
      setDebugInfo({ error: 'Failed to fetch debug info' });
    }
  };

  const toggleVisibility = () => {
    setIsVisible((prev) => {
      const next = !prev;
      if (next) void fetchDebugInfo();
      return next;
    });
  };

  if (!ENV.isDevelopment) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button type="button" onClick={toggleVisibility} className="btn btn-ghost" style={{ fontSize: '0.75rem' }}>
        Debug
      </button>

      {isVisible && (
        <div className="panel mt-2" style={{ width: 320, maxHeight: 384, overflowY: 'auto' }}>
          <div className="panel-header">
            <h2 className="panel-title" style={{ fontSize: '0.875rem' }}>
              Debug Panel
            </h2>
          </div>
          <div className="panel-body" style={{ fontSize: '0.75rem' }}>
            <p>
              <strong>Environment:</strong> {ENV.nodeEnv}
            </p>
            <p>
              <strong>API:</strong> {ENV_INFO.apiBaseUrl || 'Using proxy'}
            </p>
            <p>
              <strong>WebSocket:</strong> {ENV_INFO.wsUrl}
            </p>
            <p>
              <strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : '-'}
            </p>
            {debugInfo && (
              <p>
                <strong>Users online:</strong> {debugInfo.totalUsers ?? 0}
                {debugInfo.users && debugInfo.users.length > 0 && (
                  <span style={{ display: 'block', color: 'var(--ink-subtle)' }}>{debugInfo.users.join(', ')}</span>
                )}
              </p>
            )}
            <button type="button" className="btn btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => void fetchDebugInfo()}>
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
