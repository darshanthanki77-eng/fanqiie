import { Megaphone, TrendingUp, Wallet, BookOpen, ClipboardList, ChevronRight, Zap } from 'lucide-react';

export const Ticker = () => {
    return (
        <div className="section-container">
            <div className="ticker-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(251, 191, 36, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                    <Megaphone size={14} color="#fbbf24" />
                    <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '700', letterSpacing: '0.5px' }}>LATEST</span>
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                    <span className="ticker-animate">Welcome to FanQie TV - The future of decentralized video earning is here!</span>
                </div>
            </div>
        </div>
    );
};

import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
    const navigate = useNavigate();
    return (
        <div className="section-container">
            <div className="quick-actions">
                <div className="action-item">
                    <div className="action-icon">
                        <Zap size={24} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>Hot Assets</span>
                </div>
                <div className="action-item" onClick={() => navigate('/withdraw')}>
                    <div className="action-icon">
                        <Wallet size={24} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>Withdraw</span>
                </div>
                <div className="action-item">
                    <div className="action-icon">
                        <BookOpen size={24} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>Tutorial</span>
                </div>
            </div>
        </div>
    );
};

export const TaskCenter = () => {
    return (
        <div className="section-container">
            <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', color: '#fff', fontWeight: '700' }}>Task Center</h3>
                <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '600' }}>View All</span>
            </div>
            <div className="task-card">
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                }}>
                    <ClipboardList size={26} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '17px', color: '#fff', marginBottom: '4px', fontWeight: '700' }}>Daily Missions</h4>
                    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '400' }}>Complete 5 tasks and earn <span style={{ color: '#10b981', fontWeight: '600' }}>2.00 USDT</span> bonus</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '4px' }}>
                    <ChevronRight size={20} color="#64748b" />
                </div>
            </div>
        </div>
    );
};
