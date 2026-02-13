import React from 'react';
import { Download, Globe, Play } from 'lucide-react';

const Header = ({ onLangClick }) => {
    return (
        <header className="app-header">
            <div className="header-logo-container">
                <div className="header-logo-circle">
                    <Play size={18} fill="white" color="white" style={{ marginLeft: '2px' }} />
                </div>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>FanQie</span>
            </div>
            <div className="header-right-actions">
                <button style={{
                    background: '#2a2a3a',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                }}>
                    <Download size={16} />
                    <span>App</span>
                </button>
                <button
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
                    onClick={onLangClick}
                >
                    <Globe size={24} />
                </button>
            </div>
        </header>
    );
};

export default Header;
