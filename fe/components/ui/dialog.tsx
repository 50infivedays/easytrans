'use client';

import React from 'react';

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
  panelClassName?: string;
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
  panelClassName = '',
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
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className={`panel dialog-panel ${panelClassName}`.trim()}>
        <div className="panel-header">
          <h2 className="panel-title" id="dialog-title">
            {title}
          </h2>
          <p className="article-lead" style={{ marginTop: 8 }}>
            {description}
          </p>
        </div>
        <div className="panel-body">
          {children}
          {showActions && (
            <div className="dialog-actions">
              <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                {cancelText}
              </button>
              {onConfirm && (
                <button type="button" className="btn btn-primary" onClick={handleConfirm}>
                  {confirmText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
