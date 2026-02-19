import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Info, AlertTriangle, Bell } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import './AnnouncementDisplay.css';

export const AnnouncementPopup = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState([]);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/announcements`);
            const data = await response.json();
            if (data.success) {
                const popupAnnouncements = data.data.filter(
                    a => (a.type === 'popup' || a.type === 'both')
                );
                setAnnouncements(popupAnnouncements);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const handleDismiss = () => {
        const current = announcements[currentIndex];
        if (current) {
            setDismissed([...dismissed, current._id]);
            if (currentIndex < announcements.length - 1) {
                setCurrentIndex(currentIndex + 1);
            }
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'urgent': return <AlertCircle size={24} />;
            case 'high': return <AlertTriangle size={24} />;
            case 'medium': return <Bell size={24} />;
            default: return <Info size={24} />;
        }
    };

    const visibleAnnouncements = announcements.filter(a => !dismissed.includes(a._id));

    if (visibleAnnouncements.length === 0) return null;

    const current = visibleAnnouncements[0];

    return (
        <div className="announcement-popup-overlay">
            <div
                className="announcement-popup-card"
                style={{
                    backgroundColor: current.backgroundColor,
                    color: current.textColor
                }}
            >
                <button className="announcement-close-btn" onClick={handleDismiss}>
                    <X size={20} />
                </button>
                <div className="announcement-popup-icon" style={{ color: current.textColor }}>
                    {getPriorityIcon(current.priority)}
                </div>
                <h3 className="announcement-popup-title">{current.title}</h3>
                <p className="announcement-popup-message">{current.message}</p>
                <div className="announcement-popup-footer">
                    <span className="announcement-priority-badge" style={{
                        backgroundColor: `${current.textColor}20`,
                        color: current.textColor
                    }}>
                        {current.priority.toUpperCase()}
                    </span>
                    {visibleAnnouncements.length > 1 && (
                        <span className="announcement-counter">
                            {visibleAnnouncements.indexOf(current) + 1} / {visibleAnnouncements.length}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export const AnnouncementTicker = () => {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/announcements`);
            const data = await response.json();
            console.log('Fetched announcements:', data);
            if (data.success) {
                const tickerAnnouncements = data.data.filter(
                    a => (a.type === 'ticker' || a.type === 'both')
                );
                console.log('Ticker announcements:', tickerAnnouncements);
                setAnnouncements(tickerAnnouncements);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    if (announcements.length === 0) return null;

    // Duplicate announcements for seamless scrolling
    const duplicatedAnnouncements = [...announcements, ...announcements];

    return (
        <div className="announcement-ticker-container">
            <div className="announcement-ticker-icon">
                <Bell size={16} />
            </div>
            <div className="announcement-ticker-content">
                <div className="announcement-ticker-scroll">
                    {duplicatedAnnouncements.map((announcement, index) => (
                        <span key={`${announcement._id}-${index}`} className="announcement-ticker-item">
                            <strong>{announcement.title}:</strong> {announcement.message}
                            {index < duplicatedAnnouncements.length - 1 && <span className="ticker-separator">•</span>}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
