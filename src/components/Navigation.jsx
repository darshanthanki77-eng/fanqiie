import React from 'react';
import { House, Radio, Crown, UserPlus, User } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

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
    const [contact, setContact] = React.useState(null);

    React.useEffect(() => {
        const fetchContact = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/config/contact`);
                const data = await response.json();
                if (data.success) {
                    setContact(data.data);
                }
            } catch (error) {
                console.error('Error fetching contact:', error);
            }
        };
        fetchContact();
    }, []);

    if (!contact || !contact.telegramEnabled || !contact.telegramLink) {
        return null;
    }

    return (
        <div className="telegram-fab-container">
            <div className="telegram-pulse"></div>
            <a
                href={contact.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="telegram-fab"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="28"
                    height="28"
                    fill="white"
                >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.891 8.11l-1.92 9.043c-.145.639-.523.797-1.057.497l-2.924-2.155-1.411 1.359c-.156.156-.287.287-.588.287l.21-2.977 5.419-4.897c.236-.21-.051-.326-.366-.117L8.547 13.02 5.666 12.12c-.627-.196-.639-.627.13-.923l11.272-4.346c.523-.196.98.117.823.923z" />
                </svg>
            </a>
        </div>
    );
}

export const WhatsAppFab = () => {
    const [contact, setContact] = React.useState(null);

    React.useEffect(() => {
        const fetchContact = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/config/contact`);
                const data = await response.json();
                if (data.success) {
                    setContact(data.data);
                }
            } catch (error) {
                console.error('Error fetching contact:', error);
            }
        };
        fetchContact();
    }, []);

    if (!contact || !contact.whatsappEnabled || !contact.whatsappNumber) {
        return null;
    }

    const whatsappUrl = `https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, '')}`;

    return (
        <div className="whatsapp-fab-container">
            <div className="whatsapp-pulse"></div>
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-fab"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="28"
                    height="28"
                    fill="white"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
            </a>
        </div>
    );
}

