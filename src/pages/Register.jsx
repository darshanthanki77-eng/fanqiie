import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headset, Globe, Play, Eye, EyeOff, Send } from 'lucide-react';
import CountryCodePicker from '../components/CountryCodePicker';
import API_BASE_URL from '../apiConfig';
import './Login.css'; // Reusing styles

const Register = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('email'); // 'email' or 'mobile'
    const [showPassword, setShowPassword] = useState(false);
    const [showSecPassword, setShowSecPassword] = useState(false);
    const [dialCode, setDialCode] = useState('+1');
    const [showCountryPicker, setShowCountryPicker] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        mobile: '',
        loginPassword: '',
        securityPassword: '',
        invitationCode: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleRegister = async () => {
        setError('');
        setSuccess('');

        // Validation
        if (activeTab === 'email' && !formData.email) {
            setError('Please enter your email');
            return;
        }

        if (activeTab === 'mobile' && !formData.mobile) {
            setError('Please enter your mobile number');
            return;
        }

        if (!formData.loginPassword) {
            setError('Please enter login password');
            return;
        }

        if (formData.loginPassword.length < 6) {
            setError('Login password must be at least 6 characters');
            return;
        }

        if (!formData.securityPassword) {
            setError('Please enter security password');
            return;
        }

        if (formData.securityPassword.length < 4) {
            setError('Security password must be at least 4 characters');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                loginPassword: formData.loginPassword,
                securityPassword: formData.securityPassword,
                invitationCode: formData.invitationCode
            };

            if (activeTab === 'email') {
                payload.email = formData.email;
            } else {
                payload.mobile = formData.mobile;
                payload.dialCode = dialCode;
            }

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Registration successful!');
                // Store token
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));

                // Navigate to home after short delay
                setTimeout(() => {
                    navigate('/home');
                }, 1000);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Network error. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Header */}
            <div className="auth-header">
                <Headset size={24} color="#fff" />
                <Globe size={24} color="#fff" onClick={() => navigate('/switch-lang')} style={{ cursor: 'pointer' }} />
            </div>

            {/* Logo */}
            <div className="auth-logo-section">
                <div className="auth-logo-box">
                    <Play size={32} fill="#ef4444" color="#ef4444" style={{ marginLeft: '4px' }} />
                </div>
                <div className="auth-app-name">FanQie</div>
            </div>

            {/* Tabs */}
            <div className="auth-tabs">
                <div className="auth-tab-pill" style={{ left: activeTab === 'email' ? '0' : '50%' }} />
                <div
                    className={`auth-tab ${activeTab === 'email' ? 'active' : ''}`}
                    onClick={() => setActiveTab('email')}
                >
                    Email
                </div>
                <div
                    className={`auth-tab ${activeTab === 'mobile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mobile')}
                >
                    Mobile
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div style={{
                    padding: '10px',
                    margin: '10px 20px',
                    background: '#fee',
                    color: '#c33',
                    borderRadius: '8px',
                    fontSize: '14px'
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    padding: '10px',
                    margin: '10px 20px',
                    background: '#efe',
                    color: '#3c3',
                    borderRadius: '8px',
                    fontSize: '14px'
                }}>
                    {success}
                </div>
            )}

            {/* Form */}
            <div className="auth-form">
                {activeTab === 'email' ? (
                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="auth-input"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>
                ) : (
                    <div className="input-group">
                        <div className="mobile-code-trigger" onClick={() => setShowCountryPicker(true)}>
                            {dialCode}
                        </div>
                        <input
                            type="tel"
                            name="mobile"
                            placeholder="Mobile phone number"
                            className="auth-input"
                            value={formData.mobile}
                            onChange={handleInputChange}
                        />
                    </div>
                )}

                <div className="input-group">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="loginPassword"
                        placeholder="Login password"
                        className="auth-input"
                        value={formData.loginPassword}
                        onChange={handleInputChange}
                    />
                    <div className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </div>
                </div>

                <div className="input-group">
                    <input
                        type={showSecPassword ? "text" : "password"}
                        name="securityPassword"
                        placeholder="Security password"
                        className="auth-input"
                        value={formData.securityPassword}
                        onChange={handleInputChange}
                    />
                    <div className="eye-icon" onClick={() => setShowSecPassword(!showSecPassword)}>
                        {showSecPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </div>
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        name="invitationCode"
                        placeholder="Invitation code"
                        className="auth-input"
                        value={formData.invitationCode}
                        onChange={handleInputChange}
                    />
                </div>

                <button
                    className="auth-btn"
                    onClick={handleRegister}
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </div>

            <div className="auth-footer-link">
                Already have an account? <span className="link-highlight" onClick={() => navigate('/login')}>Login</span>
            </div>

            <div className="telegram-float-fixed">
                <Send size={24} color="white" style={{ marginLeft: '-2px', marginTop: '2px' }} />
            </div>

            <CountryCodePicker
                isOpen={showCountryPicker}
                onClose={() => setShowCountryPicker(false)}
                onSelect={(country) => setDialCode(country.dial)}
                selectedDial={dialCode}
            />
        </div>
    );
};

export default Register;
