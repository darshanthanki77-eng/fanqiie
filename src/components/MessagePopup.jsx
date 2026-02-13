import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';
import './MessagePopup.css';

const MessagePopup = ({ isOpen, message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 className="msg-icon success" size={40} />;
            case 'error': return <XCircle className="msg-icon error" size={40} />;
            case 'warning': return <AlertTriangle className="msg-icon warning" size={40} />;
            default: return <Info className="msg-icon info" size={40} />;
        }
    };

    return (
        <div className="msg-popup-overlay" onClick={onClose}>
            <div className={`msg-popup-content ${type}`} onClick={e => e.stopPropagation()}>
                <div className="msg-popup-inner">
                    {getIcon()}
                    <p className="msg-text">{message}</p>
                </div>
                <button className="msg-close-btn" onClick={onClose}>OK</button>
            </div>
        </div>
    );
};

export default MessagePopup;
