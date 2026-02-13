import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import './AdminPackages.css';

const AdminPackages = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [pendingPurchases, setPendingPurchases] = useState([]);
    const [history, setHistory] = useState([]);
    const [historyFilter, setHistoryFilter] = useState('all'); // all, active, pending
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'pending', 'history'

    // Form State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPackage, setCurrentPackage] = useState({
        level: '',
        dailyEarnings: 1, // Default tasks/count
        dailyIncome: '',  // The actual $ amount string
        unlockPrice: '',
        validDays: 365,
        isTrial: false,
        isOpenSoon: false,
        order: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab, historyFilter]);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([
            fetchPackages(),
            fetchPendingPurchases()
        ]);
        setLoading(false);
    };

    const fetchPackages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/packages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                // Sort by order or price
                const sorted = data.data.sort((a, b) => a.order - b.order);
                setPackages(sorted);
            }
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
    };

    const fetchPendingPurchases = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/packages/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setPendingPurchases(data.data);
        } catch (error) {
            console.error('Error fetching pending purchases:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/packages/history?status=${historyFilter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setHistory(data.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleEditClick = (pkg) => {
        setCurrentPackage(pkg);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleAddClick = () => {
        setCurrentPackage({
            level: '',
            dailyEarnings: 1,
            dailyIncome: '',
            unlockPrice: '',
            validDays: 365,
            isTrial: false,
            isOpenSoon: false,
            order: packages.length + 1
        });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = isEditing
                ? `${API_BASE_URL}/admin/packages/${currentPackage._id}`
                : `${API_BASE_URL}/admin/packages/create`;

            const method = isEditing ? 'PUT' : 'POST';

            // Sanitize prices: remove currency symbols, spaces etc. before saving
            const sanitizedPackage = {
                ...currentPackage,
                unlockPrice: currentPackage.unlockPrice.toString().replace(/[^0-9.]/g, ''),
                dailyIncome: currentPackage.dailyIncome.toString().replace(/[^0-9.]/g, '')
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(sanitizedPackage)
            });

            const data = await response.json();
            if (data.success) {
                alert(isEditing ? 'Package updated!' : 'Package created!');
                setShowModal(false);
                fetchPackages();
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving package:', error);
        }
    };

    const handleDeletePackage = async (id) => {
        if (!confirm('Are you sure you want to delete this package from catalog?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/packages/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                alert('Package deleted!');
                fetchPackages();
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleActivate = async (id) => {
        if (!confirm('Activate this package for the user?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/packages/activate/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                alert('Package activated!');
                fetchPendingPurchases();
                if (activeTab === 'history') fetchHistory();
            }
        } catch (error) {
            console.error('Activation error:', error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return <span className="status-badge active" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Active</span>;
            case 'pending': return <span className="status-badge pending" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Pending</span>;
            default: return <span className="status-badge" style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{status}</span>;
        }
    };

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="admin-page-header">
                <button className="back-btn-circle" onClick={() => navigate('/admin/dashboard')}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="page-title">Manage Packages</h2>
                <button className="add-btn-admin" onClick={handleAddClick}>
                    <Plus size={20} />
                </button>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'catalog' ? 'active' : ''}`}
                    onClick={() => setActiveTab('catalog')}
                >
                    Package Catalog
                </button>
                <button
                    className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Activations ({pendingPurchases.length})
                </button>
                <button
                    className={`admin-tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Package History
                </button>
            </div>

            <div className="admin-content">
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : activeTab === 'catalog' ? (
                    <div className="packages-grid-admin">
                        {packages.map((pkg) => (
                            <div key={pkg._id} className="package-card-admin">
                                <div className="pkg-header-admin">
                                    <h3 className="pkg-level">{pkg.level}</h3>
                                    <div className="pkg-price-admin">${pkg.unlockPrice}</div>
                                </div>
                                <div className="pkg-body-admin">
                                    <div className="pkg-info-row">
                                        <span>Daily Income:</span>
                                        <span style={{ color: '#10b981' }}>${pkg.dailyIncome}</span>
                                    </div>
                                    <div className="pkg-info-row">
                                        <span>Daily Tasks:</span>
                                        <span>{pkg.dailyEarnings}</span>
                                    </div>
                                    <div className="pkg-info-row">
                                        <span>Validity:</span>
                                        <span>{pkg.validDays} days</span>
                                    </div>
                                    <div className="pkg-info-row">
                                        <span>Sort Order:</span>
                                        <span>{pkg.order}</span>
                                    </div>
                                    {(pkg.isTrial || pkg.isOpenSoon) && (
                                        <div className="pkg-badges">
                                            {pkg.isTrial && <span className="badge trial">Trial</span>}
                                            {pkg.isOpenSoon && <span className="badge soon">Soon</span>}
                                        </div>
                                    )}
                                </div>
                                <div className="pkg-actions-admin">
                                    <button className="edit-btn" onClick={() => handleEditClick(pkg)}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDeletePackage(pkg._id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'pending' ? (
                    <div className="purchases-list-admin">
                        {pendingPurchases.length > 0 ? (
                            pendingPurchases.map((purchase) => (
                                <div key={purchase._id} className="purchase-card-admin">
                                    <div className="purchase-info-admin">
                                        <div className="user-details-admin">
                                            <span className="user-email">{purchase.user?.email || purchase.user?.mobile}</span>
                                            <span className="user-code">Code: {purchase.user?.invitationCode}</span>
                                        </div>
                                        <div className="package-details-admin">
                                            <span className="pkg-name">{purchase.package?.level}</span>
                                            <span className="pkg-price">${purchase.unlockPrice}</span>
                                        </div>
                                    </div>
                                    <div className="purchase-footer-admin">
                                        <span className="date-admin">{new Date(purchase.createdAt).toLocaleString()}</span>
                                        <button className="activate-btn" onClick={() => handleActivate(purchase._id)}>
                                            <CheckCircle size={16} /> Activate
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No pending activations</div>
                        )}
                    </div>
                ) : (
                    <div className="history-view">
                        <div className="filter-bar" style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
                            <select
                                value={historyFilter}
                                onChange={(e) => setHistoryFilter(e.target.value)}
                                style={{ padding: '8px', borderRadius: '8px', background: '#1e293b', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        <div className="purchases-list-admin">
                            {history.length > 0 ? (
                                history.map((purchase) => (
                                    <div key={purchase._id} className="purchase-card-admin">
                                        <div className="purchase-info-admin">
                                            <div className="user-details-admin">
                                                <span className="user-email">{purchase.user?.email || purchase.user?.mobile}</span>
                                                <span className="user-code">Code: {purchase.user?.invitationCode}</span>
                                            </div>
                                            <div className="package-details-admin">
                                                <span className="pkg-name">{purchase.package?.level}</span>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                    <span className="pkg-price">${purchase.unlockPrice}</span>
                                                    {getStatusBadge(purchase.status)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="purchase-footer-admin">
                                            <span className="date-admin">Purchased: {new Date(purchase.createdAt).toLocaleString()}</span>
                                            {purchase.activatedAt && (
                                                <span className="date-admin" style={{ marginLeft: '10px' }}>Active: {new Date(purchase.activatedAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">No history found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit/Create Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="edit-modal package-modal">
                        <div className="modal-header">
                            <h3>{isEditing ? 'Edit Package' : 'Add New Package'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body-scroll">
                                <div className="form-group">
                                    <label>Level Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentPackage.level}
                                        onChange={(e) => setCurrentPackage({ ...currentPackage, level: e.target.value })}
                                        placeholder="e.g. 1-star"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Unlock Price ($)</label>
                                        <input
                                            type="text"
                                            required
                                            value={currentPackage.unlockPrice}
                                            onChange={(e) => setCurrentPackage({ ...currentPackage, unlockPrice: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>Daily Income ($)</label>
                                        <input
                                            type="text"
                                            required
                                            value={currentPackage.dailyIncome}
                                            onChange={(e) => setCurrentPackage({ ...currentPackage, dailyIncome: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Valid Days</label>
                                        <input
                                            type="number"
                                            required
                                            value={currentPackage.validDays}
                                            onChange={(e) => setCurrentPackage({ ...currentPackage, validDays: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>Daily Tasks</label>
                                        <input
                                            type="number"
                                            required
                                            value={currentPackage.dailyEarnings}
                                            onChange={(e) => setCurrentPackage({ ...currentPackage, dailyEarnings: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Sort Order</label>
                                    <input
                                        type="number"
                                        value={currentPackage.order}
                                        onChange={(e) => setCurrentPackage({ ...currentPackage, order: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="form-row checkboxes">
                                    <div className="checkbox-group">
                                        <input
                                            type="checkbox"
                                            id="isTrial"
                                            checked={currentPackage.isTrial}
                                            onChange={(e) => setCurrentPackage({ ...currentPackage, isTrial: e.target.checked })}
                                        />
                                        <label htmlFor="isTrial">Is Trial?</label>
                                    </div>
                                    <div className="checkbox-group">
                                        <input
                                            type="checkbox"
                                            id="isOpenSoon"
                                            checked={currentPackage.isOpenSoon}
                                            onChange={(e) => setCurrentPackage({ ...currentPackage, isOpenSoon: e.target.checked })}
                                        />
                                        <label htmlFor="isOpenSoon">Open Soon?</label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="save-btn">
                                    <Save size={16} /> {isEditing ? 'Update Package' : 'Create Package'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPackages;
