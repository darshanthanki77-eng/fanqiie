import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Move } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import './AdminBanners.css';

const AdminBanners = () => {
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        image: '',
        title: '',
        description: '',
        link: '',
        isActive: true,
        autoSlide: true,
        order: 0
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/banners`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setBanners(data.data);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const resetForm = () => {
        setFormData({
            image: '',
            title: '',
            description: '',
            link: '',
            isActive: true,
            autoSlide: true,
            order: banners.length
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleEdit = (banner) => {
        setFormData({
            image: banner.image,
            title: banner.title,
            description: banner.description || '',
            link: banner.link || '',
            isActive: banner.isActive,
            autoSlide: banner.autoSlide,
            order: banner.order
        });
        setEditingId(banner._id);
        setIsAdding(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingId
                ? `${API_BASE_URL}/admin/banners/${editingId}`
                : `${API_BASE_URL}/admin/banners`;
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                alert(editingId ? 'Banner updated!' : 'Banner created!');
                fetchBanners();
                resetForm();
            } else {
                alert(data.message || 'Error processing banner');
            }
        } catch (error) {
            console.error('Error saving banner:', error);
            alert('Failed to save banner');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/banners/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchBanners();
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
        }
    };

    const toggleStatus = async (banner) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/banners/${banner._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !banner.isActive })
            });
            const data = await response.json();
            if (data.success) {
                fetchBanners();
            }
        } catch (error) {
            console.error('Error toggling banner status:', error);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-page-header">
                <button className="back-btn-circle" onClick={() => navigate('/admin/dashboard')}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="page-title">Manage Banners</h2>
                <button className="add-btn" onClick={() => setIsAdding(true)}>
                    <Plus size={20} /> Add New
                </button>
            </div>

            {isAdding && (
                <div className="banner-form-overlay">
                    <div className="banner-form-card">
                        <div className="form-header">
                            <h3>{editingId ? 'Edit Banner' : 'Create New Banner'}</h3>
                            <button className="close-btn" onClick={resetForm}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="https://example.com/image.jpg"
                                />
                                {formData.image && (
                                    <div className="image-preview">
                                        <img src={formData.image} alt="Preview" />
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Link (Optional)</label>
                                <input
                                    type="text"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleInputChange}
                                    placeholder="/recharge or https://..."
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                        /> Active
                                    </label>
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="autoSlide"
                                            checked={formData.autoSlide}
                                            onChange={handleInputChange}
                                        /> Auto-Slide
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label>Sort Order</label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="submit-btn">
                                <Save size={20} /> {editingId ? 'Update Banner' : 'Create Banner'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-content">
                {loading ? (
                    <div className="loading-state">Loading banners...</div>
                ) : (
                    <div className="banners-grid">
                        {banners.length > 0 ? (
                            banners.map((banner) => (
                                <div key={banner._id} className={`banner-admin-card ${!banner.isActive ? 'disabled' : ''}`}>
                                    <div className="banner-preview">
                                        <img src={banner.image} alt={banner.title} />
                                        <div className="banner-status-badge">
                                            {banner.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                                            {banner.isActive ? 'Active' : 'Hidden'}
                                        </div>
                                    </div>
                                    <div className="banner-info">
                                        <h4>{banner.title}</h4>
                                        <p>{banner.description}</p>
                                        <div className="banner-meta">
                                            <span>Order: {banner.order}</span>
                                            <span>Auto-Slide: {banner.autoSlide ? 'On' : 'Off'}</span>
                                        </div>
                                    </div>
                                    <div className="banner-actions">
                                        <button className="action-btn edit" onClick={() => handleEdit(banner)}>
                                            <Edit2 size={16} /> Edit
                                        </button>
                                        <button className="action-btn toggle" onClick={() => toggleStatus(banner)}>
                                            {banner.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                            {banner.isActive ? 'Hide' : 'Show'}
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(banner._id)}>
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No banners found. Click "Add New" to get started.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBanners;
