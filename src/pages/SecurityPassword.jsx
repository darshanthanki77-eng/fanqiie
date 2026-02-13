import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import './PasswordPages.css';

const SecurityPassword = ({ onBack }) => {
    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Toggle visibility states
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!oldPwd || !newPwd || !confirmPwd) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }
        if (newPwd !== confirmPwd) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/auth/update-security-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword: oldPwd,
                    newPassword: newPwd,
                    confirmPassword: confirmPwd
                })
            });

            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Security password updated successfully' });
                setOldPwd('');
                setNewPwd('');
                setConfirmPwd('');
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update security password' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pwd-container">
            <div className="app-top-nav">
                <button className="back-btn-circle" onClick={onBack}>
                    <ArrowLeft size={20} />
                </button>
                <div className="pwd-title">Security Password</div>
                <div style={{ width: '40px' }}></div>
            </div>

            <div className="pwd-form-card">
                {message.text && (
                    <div className={`pwd-message ${message.type}`} style={{
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '14px',
                        textAlign: 'center',
                        background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: message.type === 'success' ? '#10b981' : '#ef4444',
                        border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}>
                        {message.text}
                    </div>
                )}

                <div className="pwd-input-group">
                    <input
                        type={showOld ? "text" : "password"}
                        placeholder="Old security password"
                        className="pwd-input"
                        value={oldPwd}
                        onChange={e => setOldPwd(e.target.value)}
                    />
                    <div className="pwd-eye" onClick={() => setShowOld(!showOld)}>
                        {showOld ? <Eye size={18} /> : <EyeOff size={18} />}
                    </div>
                </div>

                <div className="pwd-input-group">
                    <input
                        type={showNew ? "text" : "password"}
                        placeholder="New security password"
                        className="pwd-input"
                        value={newPwd}
                        onChange={e => setNewPwd(e.target.value)}
                    />
                    <div className="pwd-eye" onClick={() => setShowNew(!showNew)}>
                        {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
                    </div>
                </div>

                <div className="pwd-input-group">
                    <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="pwd-input"
                        value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)}
                    />
                    <div className="pwd-eye" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                    </div>
                </div>

                <button
                    className="pwd-confirm-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Updating...' : 'Confirm'}
                </button>
            </div>
        </div>
    );
};

export default SecurityPassword;
