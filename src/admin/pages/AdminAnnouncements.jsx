import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Calendar, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import './AdminAnnouncements.css';

const AdminAnnouncements = () => {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'popup',
        startDate: '',
        endDate: '',
        isActive: true,
        priority: 'medium',
        backgroundColor: '#1e293b',
        textColor: '#ffffff'
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/announcements`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAnnouncements(data.data);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
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
            title: '',
            message: '',
            type: 'popup',
            startDate: '',
            endDate: '',
            isActive: true,
            priority: 'medium',
            backgroundColor: '#1e293b',
            textColor: '#ffffff'
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleEdit = (announcement) => {
        setFormData({
            title: announcement.title,
            message: announcement.message,
            type: announcement.type,
            startDate: new Date(announcement.startDate).toISOString().slice(0, 16),
            endDate: new Date(announcement.endDate).toISOString().slice(0, 16),
            isActive: announcement.isActive,
            priority: announcement.priority,
            backgroundColor: announcement.backgroundColor,
            textColor: announcement.textColor
        });
        setEditingId(announcement._id);
        setIsAdding(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingId
                ? `${API_BASE_URL}/admin/announcements/${editingId}`
                : `${API_BASE_URL}/admin/announcements`;
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
                alert(editingId ? 'Announcement updated!' : 'Announcement created!');
                fetchAnnouncements();
                resetForm();
            } else {
                alert(data.message || 'Error processing announcement');
            }
        } catch (error) {
            console.error('Error saving announcement:', error);
            alert('Failed to save announcement');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/announcements/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchAnnouncements();
            }
        } catch (error) {
            console.error('Error deleting announcement:', error);
        }
    };

    const toggleStatus = async (announcement) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/announcements/${announcement._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !announcement.isActive })
            });
            const data = await response.json();
            if (data.success) {
                fetchAnnouncements();
            }
        } catch (error) {
            console.error('Error toggling announcement status:', error);
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: '#64748b',
            medium: '#3b82f6',
            high: '#f59e0b',
            urgent: '#ef4444'
        };
        return colors[priority] || colors.medium;
    };

    const isActive = (announcement) => {
        const now = new Date();
        const start = new Date(announcement.startDate);
        const end = new Date(announcement.endDate);
        return announcement.isActive && now >= start && now <= end;
    };

    return (
        <div className="admin-container">
            <div className="admin-page-header">
                <button className="back-btn-circle" onClick={() => navigate('/admin/dashboard')}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="page-title">Manage Announcements</h2>
                <button className="add-btn" onClick={() => setIsAdding(true)}>
                    <Plus size={20} /> Add New
                </button>
            </div>

            {isAdding && (
                <div className="announcement-form-overlay">
                    <div className="announcement-form-card">
                        <div className="form-header">
                            <h3>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</h3>
                            <button className="close-btn" onClick={resetForm}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Maintenance Notice"
                                />
                            </div>
                            <div className="form-group">
                                <label>Message *</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows="4"
                                    placeholder="Enter your announcement message..."
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Display Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange}>
                                        <option value="popup">Popup Modal</option>
                                        <option value="ticker">Scrolling Ticker</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select name="priority" value={formData.priority} onChange={handleInputChange}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Background Color</label>
                                    <input
                                        type="color"
                                        name="backgroundColor"
                                        value={formData.backgroundColor}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Text Color</label>
                                    <input
                                        type="color"
                                        name="textColor"
                                        value={formData.textColor}
                                        onChange={handleInputChange}
                                    />
                                </div>
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
                            </div>
                            <button type="submit" className="submit-btn">
                                <Save size={20} /> {editingId ? 'Update Announcement' : 'Create Announcement'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-content">
                {loading ? (
                    <div className="loading-state">Loading announcements...</div>
                ) : (
                    <div className="announcements-list">
                        {announcements.length > 0 ? (
                            announcements.map((announcement) => (
                                <div key={announcement._id} className={`announcement-admin-card ${!isActive(announcement) ? 'disabled' : ''}`}>
                                    <div className="announcement-header">
                                        <div className="announcement-title-row">
                                            <h4>{announcement.title}</h4>
                                            <span
                                                className="priority-badge"
                                                style={{ backgroundColor: getPriorityColor(announcement.priority) }}
                                            >
                                                {announcement.priority}
                                            </span>
                                        </div>
                                        <div className="announcement-status-badge">
                                            {isActive(announcement) ? (
                                                <><Eye size={14} /> Active</>
                                            ) : (
                                                <><EyeOff size={14} /> Inactive</>
                                            )}
                                        </div>
                                    </div>
                                    <p className="announcement-message">{announcement.message}</p>
                                    <div className="announcement-meta">
                                        <span><Calendar size={14} /> {new Date(announcement.startDate).toLocaleDateString()}</span>
                                        <span>to {new Date(announcement.endDate).toLocaleDateString()}</span>
                                        <span className="type-badge">{announcement.type}</span>
                                    </div>
                                    <div className="announcement-actions">
                                        <button className="action-btn edit" onClick={() => handleEdit(announcement)}>
                                            <Edit2 size={16} /> Edit
                                        </button>
                                        <button className="action-btn toggle" onClick={() => toggleStatus(announcement)}>
                                            {announcement.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                            {announcement.isActive ? 'Disable' : 'Enable'}
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(announcement._id)}>
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No announcements found. Click "Add New" to create one.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnnouncements;
