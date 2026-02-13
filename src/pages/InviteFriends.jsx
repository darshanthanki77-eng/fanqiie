import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import API_BASE_URL from '../apiConfig';
import {
    Copy,
    Download,
    Globe,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    MessageCircle,
    Send,
    PlayCircle,
    Check,
    Star,
    ArrowLeft,
    Share2,
    Users,
    Trophy
} from 'lucide-react';
import './InviteFriends.css';

const InviteFriends = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [baseUrl, setBaseUrl] = useState('');
    const [copiedType, setCopiedType] = useState(null); // 'code' or 'link'
    const [rates, setRates] = useState({ L1: 13, L2: 1, L3: 1 });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setBaseUrl(window.location.origin);
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/team/rates`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.data) {
                setRates(data.data);
            }
        } catch (error) {
            console.error('Error fetching rates:', error);
        }
    };

    const totalPercent = (rates.L1 || 0) + (rates.L2 || 0) + (rates.L3 || 0);
    const exampleDeposit = 1000;
    const l1Income = ((exampleDeposit * (rates.L1 || 0)) / 100).toLocaleString();
    const l2Income = ((exampleDeposit * (rates.L2 || 0)) / 100).toLocaleString();
    const l3Income = ((exampleDeposit * (rates.L3 || 0)) / 100).toLocaleString();

    const inviteCode = user?.invitationCode || '2111';
    const inviteLink = `${baseUrl}/register?ref=${inviteCode}`;

    const copyToClipboard = (text, type) => {
        if (!text || text === 'N/A') return;
        navigator.clipboard.writeText(text).then(() => {
            setCopiedType(type);
            setTimeout(() => setCopiedType(null), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    return (
        <div className="invite-page-wrapper">
            <div className="invite-container">
                {/* Standard Header */}
                <div className="app-top-nav">
                    <button className="back-btn-circle" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="invite-header-title">Invite Friends</div>
                    <div className="header-actions">
                        <button className="header-icon-btn">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>

                <main className="invite-main-content">
                    {/* Hero Section */}
                    <div className="invite-hero-card">
                        <div className="hero-decor-circles">
                            <div className="circle-1"></div>
                            <div className="circle-2"></div>
                        </div>
                        <div className="hero-content-box">
                            <div className="trophy-badge">
                                <Trophy size={24} color="#fff" />
                            </div>
                            <h2>Invite & Earn</h2>
                            <p>Share with friends and build your elite team together</p>
                        </div>
                    </div>

                    {/* Primary Card: QR and Invitation Info */}
                    <div className="invite-grid">
                        <section className="invite-card-section animate-fade-up" style={{ animationDelay: '0.1s' }}>
                            <div className="premium-glass-card">
                                <div className="qr-box-container">
                                    <div className="qr-outer-glow">
                                        <div className="qr-wrapper">
                                            <QRCodeSVG
                                                value={inviteLink}
                                                size={160}
                                                bgColor={"#ffffff"}
                                                fgColor={"#000000"}
                                                level={"H"}
                                                includeMargin={true}
                                            />
                                        </div>
                                    </div>
                                    <p className="qr-label">Scan QR code to join my team</p>
                                </div>

                                <div className="invite-details">
                                    <div className="invite-input-row">
                                        <label>Invitation Code</label>
                                        <div className="premium-input-box">
                                            <span className="code-display">{inviteCode}</span>
                                            <button className="copy-action-btn" onClick={() => copyToClipboard(inviteCode, 'code')}>
                                                {copiedType === 'code' ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="invite-input-row">
                                        <label>Invitation Link</label>
                                        <div className="premium-input-box">
                                            <span className="link-display">{inviteLink}</span>
                                            <button className="copy-action-btn" onClick={() => copyToClipboard(inviteLink, 'link')}>
                                                {copiedType === 'link' ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="share-section">
                                    <p className="share-hint">Quick Share</p>
                                    <div className="social-grid">
                                        <button className="social-pill tw"><Twitter size={16} /><span>Twitter</span></button>
                                        <button className="social-pill tg"><Send size={16} /><span>Telegram</span></button>
                                        <button className="social-pill wa"><MessageCircle size={16} /><span>WhatsApp</span></button>
                                        <button className="social-pill fb"><Facebook size={16} /><span>Facebook</span></button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Secondary Section: Advantages & Commissions */}
                        <section className="invite-info-section animate-fade-up" style={{ animationDelay: '0.2s' }}>
                            <div className="premium-glass-card secondary">
                                <div className="advantages-header">
                                    <div className="title-with-icon">
                                        <Users size={20} color="#6366f1" />
                                        <h3>Team Benefits</h3>
                                    </div>
                                    <div className="premium-stars">
                                        <Star size={12} fill="#fbbf24" color="#fbbf24" />
                                        <Star size={12} fill="#fbbf24" color="#fbbf24" />
                                        <Star size={12} fill="#fbbf24" color="#fbbf24" />
                                    </div>
                                </div>

                                <p className="advantages-desc">
                                    Unlock exclusive authorization to expand your network. Earn high-tier rewards and scale your team revenue exponentially.
                                </p>

                                <div className="reward-summary-card">
                                    <div className="reward-title">
                                        Invitation Reward Up To <span className="highlight-gradient">{totalPercent}%</span>
                                    </div>
                                    <div className="level-nodes-container">
                                        <div className="level-node">
                                            <div className="node-icon-bg"><Star size={14} /></div>
                                            <div className="node-info">
                                                <span className="lvl">L1 Member</span>
                                                <span className="pct">{rates.L1}%</span>
                                            </div>
                                        </div>
                                        <div className="level-node">
                                            <div className="node-icon-bg"><Star size={14} /></div>
                                            <div className="node-info">
                                                <span className="lvl">L2 Member</span>
                                                <span className="pct">{rates.L2}%</span>
                                            </div>
                                        </div>
                                        <div className="level-node">
                                            <div className="node-icon-bg"><Star size={14} /></div>
                                            <div className="node-info">
                                                <span className="lvl">L3 Member</span>
                                                <span className="pct">{rates.L3}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="calculation-guide">
                                    <p className="guide-title">Revenue Example ({exampleDeposit.toLocaleString()} USDT Deposit):</p>
                                    <div className="guide-list">
                                        <div className="guide-item">
                                            <div className="item-label">Direct Referral (L1)</div>
                                            <div className="item-value">+{l1Income} USDT</div>
                                        </div>
                                        <div className="guide-item">
                                            <div className="item-label">Indirect (L2)</div>
                                            <div className="item-value">+{l2Income} USDT</div>
                                        </div>
                                        <div className="guide-item">
                                            <div className="item-label">Network (L3)</div>
                                            <div className="item-value">+{l3Income} USDT</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default InviteFriends;
