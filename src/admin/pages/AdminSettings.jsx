import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Settings, Percent, Info, RefreshCw, MessageCircle, MessageSquare } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import './AdminSettings.css';

const AdminSettings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [rechargeRates, setRechargeRates] = useState({ L1: 13, L2: 1, L3: 1 });
    const [taskRates, setTaskRates] = useState({ L1: 1, L2: 1, L3: 1 });
    const [withdrawalFee, setWithdrawalFee] = useState(5);
    const [minWithdrawal, setMinWithdrawal] = useState(2);
    const [noSubordinateWithdrawPercent, setNoSubordinateWithdrawPercent] = useState(100);
    const [contact, setContact] = useState({
        whatsappNumber: '',
        telegramLink: '',
        whatsappEnabled: true,
        telegramEnabled: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setRechargeRates(data.data.recharge);
                setTaskRates(data.data.task);
                setWithdrawalFee(data.data.withdrawalFee || 5);
                setMinWithdrawal(data.data.minWithdrawal || 2);
                setNoSubordinateWithdrawPercent(data.data.noSubordinateWithdrawPercent || 100);
                if (data.data.contact) setContact(data.data.contact);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            showTempMessage('error', 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    recharge: rechargeRates,
                    task: taskRates,
                    withdrawalFee: Number(withdrawalFee),
                    minWithdrawal: Number(minWithdrawal),
                    noSubordinateWithdrawPercent: Number(noSubordinateWithdrawPercent),
                    contact: contact
                })
            });
            const data = await response.json();
            if (data.success) {
                showTempMessage('success', 'Settings updated successfully');
            } else {
                showTempMessage('error', data.message || 'Failed to update settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            showTempMessage('error', 'Network error while saving');
        } finally {
            setSaving(false);
        }
    };

    const showTempMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleRateChange = (type, level, val) => {
        const numVal = parseFloat(val) || 0;
        if (type === 'recharge') {
            setRechargeRates(prev => ({ ...prev, [level]: numVal }));
        } else {
            setTaskRates(prev => ({ ...prev, [level]: numVal }));
        }
    };

    const RateGrid = ({ title, subtitle, rates, type }) => (
        <div className="settings-page-card" style={{ marginBottom: '24px' }}>
            <div className="settings-section-header">
                <div className="settings-icon-box">
                    {type === 'recharge' ? <Percent size={24} color="#6366f1" /> : <Settings size={24} color="#10b981" />}
                </div>
                <div className="settings-title-box">
                    <h3>{title}</h3>
                    <p>{subtitle}</p>
                </div>
            </div>

            <div className="settings-rate-grid">
                {['L1', 'L2', 'L3'].map((lvl, idx) => (
                    <div key={lvl} className="settings-rate-field">
                        <div className="settings-field-label-row">
                            <label>Level {idx + 1} {lvl === 'L1' ? '(Direct)' : '(In-Direct)'}</label>
                            <span className="settings-current-badge">{rates[lvl]}%</span>
                        </div>
                        <div className="settings-input-wrapper">
                            <input
                                type="number"
                                step="0.1"
                                value={rates[lvl]}
                                onChange={(e) => handleRateChange(type, lvl, e.target.value)}
                            />
                            <span className="settings-percent-unit">%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="admin-settings-container">
            <div className="admin-page-header">
                <div className="settings-header-left">
                    <button className="settings-back-btn" onClick={() => navigate('/admin/dashboard')}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="settings-page-title">System Settings</h2>
                </div>
            </div>

            <div className="admin-content narrow">
                {loading ? (
                    <div className="settings-loading-state">
                        <RefreshCw className="settings-spin" size={24} />
                        <span>Loading configurations...</span>
                    </div>
                ) : (
                    <form className="settings-form" onSubmit={handleSave}>
                        <RateGrid
                            type="recharge"
                            title="First Recharge Commission"
                            subtitle="Bonus paid when a downline makes their first deposit"
                            rates={rechargeRates}
                        />

                        <RateGrid
                            type="task"
                            title="Daily Task Commission"
                            subtitle="Passive income shared when a downline completes daily tasks"
                            rates={taskRates}
                        />

                        {/* Withdrawal Section */}
                        <div className="settings-page-card" style={{ marginBottom: '24px' }}>
                            <div className="settings-section-header">
                                <div className="settings-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                    <Percent size={24} color="#ef4444" />
                                </div>
                                <div className="settings-title-box">
                                    <h3>Withdrawal Settings</h3>
                                    <p>Configure withdrawal limits and processing fees</p>
                                </div>
                            </div>

                            <div className="settings-rate-grid">
                                <div className="settings-rate-field">
                                    <div className="settings-field-label-row">
                                        <label>Standard Withdrawal Fee</label>
                                        <span className="settings-current-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>{withdrawalFee}%</span>
                                    </div>
                                    <div className="settings-input-wrapper">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={withdrawalFee}
                                            onChange={(e) => setWithdrawalFee(parseFloat(e.target.value) || 0)}
                                        />
                                        <span className="settings-percent-unit">%</span>
                                    </div>
                                </div>

                                <div className="settings-rate-field">
                                    <div className="settings-field-label-row">
                                        <label>Minimum Withdrawal</label>
                                        <span className="settings-current-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>{minWithdrawal} USDT</span>
                                    </div>
                                    <div className="settings-input-wrapper">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={minWithdrawal}
                                            onChange={(e) => setMinWithdrawal(parseFloat(e.target.value) || 0)}
                                        />
                                        <span className="settings-percent-unit">USDT</span>
                                    </div>
                                </div>

                                <div className="settings-rate-field">
                                    <div className="settings-field-label-row">
                                        <label>Restricted Withdrawal % (No Refs)</label>
                                        <span className="settings-current-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>{noSubordinateWithdrawPercent}%</span>
                                    </div>
                                    <div className="settings-input-wrapper">
                                        <input
                                            type="number"
                                            step="1"
                                            value={noSubordinateWithdrawPercent}
                                            onChange={(e) => setNoSubordinateWithdrawPercent(parseInt(e.target.value) || 0)}
                                        />
                                        <span className="settings-percent-unit">%</span>
                                    </div>
                                    <p className="settings-field-hint" style={{ color: '#94a3b8', fontSize: '11px', marginTop: '8px' }}>
                                        Maximum withdrawable amount as a % of total deposits for users with no subordinates.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Settings Section */}
                        <div className="settings-page-card" style={{ marginBottom: '24px' }}>
                            <div className="settings-section-header">
                                <div className="settings-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                                    <MessageCircle size={24} color="#10b981" />
                                </div>
                                <div className="settings-title-box">
                                    <h3>Support Contact Settings</h3>
                                    <p>Configure WhatsApp and Telegram support buttons</p>
                                </div>
                            </div>

                            <div className="settings-rate-grid">
                                <div className="settings-rate-field">
                                    <div className="settings-field-label-row">
                                        <label>WhatsApp Number</label>
                                        <label className="settings-toggle">
                                            <input
                                                type="checkbox"
                                                checked={contact.whatsappEnabled}
                                                onChange={(e) => setContact({ ...contact, whatsappEnabled: e.target.checked })}
                                            />
                                            <span>Enabled</span>
                                        </label>
                                    </div>
                                    <div className="settings-input-wrapper">
                                        <input
                                            type="text"
                                            value={contact.whatsappNumber}
                                            onChange={(e) => setContact({ ...contact, whatsappNumber: e.target.value })}
                                            placeholder="+1234567890"
                                        />
                                        <span className="settings-percent-unit">📱</span>
                                    </div>
                                </div>

                                <div className="settings-rate-field">
                                    <div className="settings-field-label-row">
                                        <label>Telegram Link</label>
                                        <label className="settings-toggle">
                                            <input
                                                type="checkbox"
                                                checked={contact.telegramEnabled}
                                                onChange={(e) => setContact({ ...contact, telegramEnabled: e.target.checked })}
                                            />
                                            <span>Enabled</span>
                                        </label>
                                    </div>
                                    <div className="settings-input-wrapper">
                                        <input
                                            type="text"
                                            value={contact.telegramLink}
                                            onChange={(e) => setContact({ ...contact, telegramLink: e.target.value })}
                                            placeholder="https://t.me/username"
                                        />
                                        <span className="settings-percent-unit">✈️</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="settings-info-banner">
                            <Info size={18} />
                            <span>Changes apply to all future transactions immediately.</span>
                        </div>

                        {message.text && (
                            <div className={`settings-form-feedback ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="settings-form-actions">
                            <button type="submit" className="settings-save-btn" disabled={saving}>
                                {saving ? (
                                    <RefreshCw size={18} className="settings-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                {saving ? 'Saving...' : 'Update All Settings'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminSettings;
