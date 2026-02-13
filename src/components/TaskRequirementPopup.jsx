import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Wallet, X } from 'lucide-react';
import './TaskRequirementPopup.css';

const TaskRequirementPopup = ({ isOpen, onClose, amount }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="task-popup-overlay" onClick={onClose}>
            <div className="task-popup-content" onClick={e => e.stopPropagation()}>
                <button className="task-popup-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="task-popup-header">
                    <h3>Requirement Restricted</h3>
                    <p>You need an active VIP package to earn income from this task.</p>
                </div>

                <div className="task-action-grid">
                    <div className="task-action-card" onClick={() => { onClose(); navigate('/vip'); }}>
                        <div className="action-icon-box yellow">
                            <ShoppingCart size={24} />
                        </div>
                        <span>Buy Package</span>
                    </div>

                    <div className="task-action-card" onClick={() => { onClose(); navigate('/recharge', { state: { amount } }); }}>
                        <div className="action-icon-box blue">
                            <Wallet size={24} />
                        </div>
                        <span>Deposit Now</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskRequirementPopup;
