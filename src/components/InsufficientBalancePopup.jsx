import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InsufficientBalancePopup.css';

const InsufficientBalancePopup = ({ isOpen, onClose, amount }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleConfirm = () => {
        onClose();
        navigate('/recharge', { state: { amount } });
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <div className="popup-message">
                    Insufficient balance. Please recharge first
                </div>
                <button className="popup-confirm-btn" onClick={handleConfirm}>
                    Confirm
                </button>
            </div>
        </div>
    );
};

export default InsufficientBalancePopup;
