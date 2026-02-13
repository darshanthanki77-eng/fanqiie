import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import './Recharge.css';

const Recharge = () => {
    const navigate = useNavigate();

    const location = useLocation();
    const initialAmount = location.state?.amount || '';

    const rechargeOptions = [
        { id: 'trc20-usdt', name: 'TRC20-USDT', color: '#26A17B', icon: 'U' },
        { id: 'trx', name: 'TRX', color: '#FF0013', icon: 'T' },
        { id: 'bep20-usdt', name: 'BEP20-USDT', color: '#F3BA2F', icon: 'U' },
        { id: 'bnb', name: 'BNB', color: '#F3BA2F', icon: 'B' },
        { id: 'bep20-usdc', name: 'BEP20-USDC', color: '#2775CA', icon: 'C' },
        { id: 'polygon-usdt', name: 'POLYGON-USDT', color: '#8247E5', icon: 'U' },
        { id: 'eth-usdt', name: 'ETH-USDT', color: '#627EEA', icon: 'U' },
        { id: 'polygon-usdc', name: 'POLYGON-USDC', color: '#8247E5', icon: 'C' },
        { id: 'eth-usdc', name: 'ETH-USDC', color: '#627EEA', icon: 'C' },
        { id: 'eth', name: 'ETH', color: '#627EEA', icon: 'E' },
        { id: 'polygon', name: 'POLYGON', color: '#8247E5', icon: 'P' },
        { id: 'eth-pyusd', name: 'ETH-PYUSD', color: '#003087', icon: 'P' },
    ];

    const handleSelect = (option) => {
        navigate('/recharge-detail', { state: { option, amount: initialAmount } });
    };

    return (
        <div className="recharge-page-container">
            {/* Header */}
            <div className="recharge-header">
                <button className="recharge-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="recharge-title">Recharge Select</h2>
                <div style={{ width: '20px' }}></div>
            </div>

            {/* Options List */}
            <div className="recharge-list-container">
                <div className="recharge-list-card premium-card">
                    {rechargeOptions.map((opt, index) => (
                        <div
                            key={opt.id}
                            className="recharge-item"
                            onClick={() => handleSelect(opt)}
                        >
                            <div className="recharge-item-left">
                                <div
                                    className="coin-icon"
                                    style={{ background: opt.color }}
                                >
                                    {opt.icon}
                                </div>
                                <span className="coin-name">{opt.name}</span>
                            </div>
                            <ChevronRight size={18} color="#64748b" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Recharge;
