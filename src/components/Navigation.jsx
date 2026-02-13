import React from 'react';
import { House, Radio, Crown, UserPlus, User } from 'lucide-react';

export const BottomNav = ({ activeTab, setActiveTab, labels }) => {
    const defaultLabels = { home: 'Home', promotion: 'Promotion', vip: 'VIP', invite: 'Invite Friends', me: 'Me' };
    const l = labels || defaultLabels;

    const items = [
        { id: 'home', label: l.home, icon: <House size={20} /> },
        { id: 'promotion', label: l.promotion, icon: <Radio size={20} /> },
        { id: 'vip', label: l.vip, icon: <Crown size={20} /> },
        { id: 'invite', label: l.invite, icon: <UserPlus size={20} /> },
        { id: 'me', label: l.me, icon: <User size={20} /> },
    ];

    return (
        <nav className="bottom-nav">
            {items.map((item) => (
                <div
                    key={item.id}
                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                >
                    <div className="nav-icon-wrapper">
                        {item.icon}
                    </div>
                    <span className="nav-label">{item.label}</span>
                    {activeTab === item.id && <div className="active-indicator" />}
                </div>
            ))}
        </nav>
    );
};

export const NotificationFooter = ({ user }) => {
    const maskUser = (id) => {
        if (!id) return 'User';
        if (id.includes('@')) {
            const [local, domain] = id.split('@');
            return `${local.substring(0, 2)}****@${domain}`;
        }
        return `+${id.substring(0, 2)}****${id.slice(-2)}`;
    };

    const displayUser = user ? maskUser(user.email || user.mobile) : '+75****14';
    const displayLevel = user?.highestPackage || '10-star';
    const displayInvites = user ? (user.directInvites || 0) : 48;

    return (
        <div className="section-container" style={{ margin: '40px 0' }}>
            <div className="notification-card">
                <div className="notification-dot"></div>
                <p className="notification-text">
                    Congratulations to <span className="highlight-yellow">{displayUser}</span> for unlocking <span className="highlight-yellow">{displayLevel}</span> and directly inviting <span className="highlight-green">{displayInvites}</span> people.
                </p>
            </div>
        </div>
    );
};

export const TelegramFab = () => {
    return (
        <div className="telegram-fab-container">
            <div className="telegram-pulse"></div>
            <div className="telegram-fab">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                    alt="Telegram"
                    className="telegram-logo"
                />
            </div>
        </div>
    );
}

