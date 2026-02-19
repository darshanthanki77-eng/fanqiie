import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Play, Video, Edit2, Zap } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import './AdminTrailers.css';

const AdminTrailers = () => {
    const navigate = useNavigate();
    const [trailers, setTrailers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTrailerId, setCurrentTrailerId] = useState(null);
    const [newTrailer, setNewTrailer] = useState({
        title: '',
        thumbnail: '',
        videoUrl: '',
        duration: '0:00',
        category: 'Trailer',
        points: 0,
        autoViewsEnabled: false,
        baseViews: 23000,
        dailyIncrement: 500,
        autoLikesEnabled: false,
        likeRatio: 0.8,
        autoRatingEnabled: false,
        ratingValue: 4.5,
        isRatingDynamic: false
    });
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkSettings, setBulkSettings] = useState({
        target: 'all', // all, category
        category: 'Trailer',
        autoViewsEnabled: true,
        baseViews: 23000,
        dailyIncrement: 500,
        autoLikesEnabled: true,
        likeRatio: 0.8,
        autoRatingEnabled: true,
        ratingValue: 4.5,
        isRatingDynamic: true
    });

    useEffect(() => {
        fetchTrailers();
    }, []);

    const fetchTrailers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/trailers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // If the admin route fails, try the public route as fallback or standard
            // but we exposed it in adminRoutes as POST/DELETE. GET might need to use public or admin.
            // Let's assume we need to fetch from public if admin GET is not defined, 
            // OR we define GET in adminRoutes. 
            // Checking adminRoutes.js: We defined POST and DELETE for /trailers, but not GET.
            // So we should fetch from public /api/trailers or add GET to adminRoutes.
            // Let's fetch from public for now as it's easier.

            const publicResponse = await fetch(`${API_BASE_URL}/trailers`);
            const data = await publicResponse.json();

            if (data.success) {
                setTrailers(data.data);
            }
        } catch (error) {
            console.error('Error fetching trailers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setIsEditing(false);
        setNewTrailer({
            title: '', thumbnail: '', videoUrl: '', duration: '0:00', category: 'Trailer',
            points: 0,
            autoViewsEnabled: false, baseViews: 23000, dailyIncrement: 500,
            autoLikesEnabled: false, likeRatio: 0.8,
            autoRatingEnabled: false, ratingValue: 4.5, isRatingDynamic: false
        });
        setShowAddModal(true);
    };

    const handleEditClick = (trailer) => {
        setIsEditing(true);
        setCurrentTrailerId(trailer._id);
        setNewTrailer({
            title: trailer.title,
            thumbnail: trailer.thumbnail,
            videoUrl: trailer.videoUrl,
            duration: trailer.duration,
            category: trailer.category,
            points: trailer.points || 0,
            autoViewsEnabled: trailer.autoViewsEnabled || false,
            baseViews: trailer.baseViews || 0,
            dailyIncrement: trailer.dailyIncrement || 0,
            autoLikesEnabled: trailer.autoLikesEnabled || false,
            likeRatio: trailer.likeRatio || 0.8,
            autoRatingEnabled: trailer.autoRatingEnabled || false,
            ratingValue: trailer.ratingValue || 4.5,
            isRatingDynamic: trailer.isRatingDynamic || false
        });
        setShowAddModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = isEditing
                ? `${API_BASE_URL}/admin/trailers/${currentTrailerId}`
                : `${API_BASE_URL}/admin/trailers`;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newTrailer)
            });
            const data = await response.json();
            if (data.success) {
                alert(isEditing ? 'Trailer updated!' : 'Trailer added!');
                setShowAddModal(false);
                fetchTrailers();
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving trailer:', error);
        }
    };

    const handleDeleteTrailer = async (id) => {
        if (!confirm('Are you sure you want to delete this trailer?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/trailers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                alert('Trailer deleted!');
                fetchTrailers();
            }
        } catch (error) {
            console.error('Error deleting trailer:', error);
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/trailers/bulk-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    target: bulkSettings.target,
                    category: bulkSettings.category,
                    settings: {
                        autoViewsEnabled: bulkSettings.autoViewsEnabled,
                        baseViews: bulkSettings.baseViews,
                        dailyIncrement: bulkSettings.dailyIncrement,
                        autoLikesEnabled: bulkSettings.autoLikesEnabled,
                        likeRatio: bulkSettings.likeRatio,
                        autoRatingEnabled: bulkSettings.autoRatingEnabled,
                        ratingValue: bulkSettings.ratingValue,
                        isRatingDynamic: bulkSettings.isRatingDynamic
                    }
                })
            });
            const data = await response.json();
            if (data.success) {
                alert(data.message);
                setShowBulkModal(false);
                fetchTrailers();
            } else {
                alert(data.message || 'Bulk update failed');
            }
        } catch (error) {
            console.error('Error in bulk update:', error);
        }
    };

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="admin-page-header">
                <button className="back-btn-circle" onClick={() => navigate('/admin/dashboard')}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="page-title">Manage Trailers</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="add-btn-admin" style={{ background: '#f59e0b' }} onClick={() => setShowBulkModal(true)} title="Bulk Engagement Update">
                        <Zap size={20} />
                    </button>
                    <button className="add-btn-admin" onClick={handleAddClick} title="Add Trailer">
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="admin-content">
                {loading ? (
                    <div className="loading-state">Loading trailers...</div>
                ) : trailers.length > 0 ? (
                    <div className="trailers-grid">
                        {trailers.map((trailer) => (
                            <div key={trailer._id} className="trailer-card-admin">
                                <div className="trailer-cover">
                                    <img src={trailer.thumbnail} alt={trailer.title} onError={(e) => e.target.src = 'https://via.placeholder.com/300x150?text=No+Image'} />
                                    <div className="play-icon-overlay">
                                        <Play size={24} fill="white" />
                                    </div>
                                    <span className="duration-badge">{trailer.duration}</span>
                                </div>
                                <div className="trailer-info">
                                    <div className="info-text">
                                        <h4>{trailer.title}</h4>
                                        <span className="category-tag">{trailer.category}</span>
                                    </div>
                                    <div className="actions-row">
                                        <button className="edit-btn-icon" onClick={() => handleEditClick(trailer)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="delete-btn-icon" onClick={() => handleDeleteTrailer(trailer._id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">No trailers found</div>
                )}
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="edit-modal">
                        <div className="modal-header">
                            <h3>{isEditing ? 'Edit Trailer' : 'Add New Trailer'}</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTrailer.title}
                                        onChange={(e) => setNewTrailer({ ...newTrailer, title: e.target.value })}
                                        placeholder="Enter video title"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={newTrailer.category}
                                        onChange={(e) => setNewTrailer({ ...newTrailer, category: e.target.value })}
                                        style={{ width: '100%', padding: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '8px' }}
                                    >
                                        <option value="Trailer">Trailer</option>
                                        <option value="Commercial advertising">Commercial advertising</option>
                                        <option value="Music">Music</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Thumbnail URL</label>
                                    <input
                                        type="url"
                                        required
                                        value={newTrailer.thumbnail}
                                        onChange={(e) => setNewTrailer({ ...newTrailer, thumbnail: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Video URL</label>
                                    <input
                                        type="url"
                                        required
                                        value={newTrailer.videoUrl}
                                        onChange={(e) => setNewTrailer({ ...newTrailer, videoUrl: e.target.value })}
                                        placeholder="https://example.com/video.mp4"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Points / Reward</label>
                                    <input
                                        type="number"
                                        required
                                        value={newTrailer.points}
                                        onChange={(e) => setNewTrailer({ ...newTrailer, points: e.target.value })}
                                        placeholder="e.g. 100"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Duration</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTrailer.duration}
                                        onChange={(e) => setNewTrailer({ ...newTrailer, duration: e.target.value })}
                                        placeholder="e.g. 2:30"
                                    />
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '20px 0' }} />

                                <div className="engagement-admin-section">
                                    <h4 className="section-subtitle">Automatic Engagement Settings</h4>

                                    {/* Views System */}
                                    <div className="engagement-row">
                                        <div className="engagement-col">
                                            <label className="toggle-label">
                                                <input
                                                    type="checkbox"
                                                    checked={newTrailer.autoViewsEnabled}
                                                    onChange={(e) => setNewTrailer({ ...newTrailer, autoViewsEnabled: e.target.checked })}
                                                />
                                                Auto Views System
                                            </label>
                                        </div>
                                        {newTrailer.autoViewsEnabled && (
                                            <>
                                                <div className="engagement-col">
                                                    <label>Base Views</label>
                                                    <input
                                                        type="number"
                                                        value={newTrailer.baseViews}
                                                        onChange={(e) => setNewTrailer({ ...newTrailer, baseViews: e.target.value })}
                                                    />
                                                </div>
                                                <div className="engagement-col">
                                                    <label>Daily Increment</label>
                                                    <input
                                                        type="number"
                                                        value={newTrailer.dailyIncrement}
                                                        onChange={(e) => setNewTrailer({ ...newTrailer, dailyIncrement: e.target.value })}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Likes System */}
                                    <div className="engagement-row">
                                        <div className="engagement-col">
                                            <label className="toggle-label">
                                                <input
                                                    type="checkbox"
                                                    checked={newTrailer.autoLikesEnabled}
                                                    onChange={(e) => setNewTrailer({ ...newTrailer, autoLikesEnabled: e.target.checked })}
                                                />
                                                Auto Likes System
                                            </label>
                                        </div>
                                        {newTrailer.autoLikesEnabled && (
                                            <div className="engagement-col">
                                                <label>Like Ratio (0.1 - 1.0)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0.1"
                                                    max="1.0"
                                                    value={newTrailer.likeRatio}
                                                    onChange={(e) => setNewTrailer({ ...newTrailer, likeRatio: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Rating System */}
                                    <div className="engagement-row">
                                        <div className="engagement-col">
                                            <label className="toggle-label">
                                                <input
                                                    type="checkbox"
                                                    checked={newTrailer.autoRatingEnabled}
                                                    onChange={(e) => setNewTrailer({ ...newTrailer, autoRatingEnabled: e.target.checked })}
                                                />
                                                Auto Rating System
                                            </label>
                                        </div>
                                        {newTrailer.autoRatingEnabled && (
                                            <>
                                                <div className="engagement-col">
                                                    <label>Rating Value (Stars)</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        min="1"
                                                        max="5"
                                                        value={newTrailer.ratingValue}
                                                        onChange={(e) => setNewTrailer({ ...newTrailer, ratingValue: e.target.value })}
                                                    />
                                                </div>
                                                <div className="engagement-col">
                                                    <label className="toggle-label" style={{ fontSize: '11px', marginTop: '10px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={newTrailer.isRatingDynamic}
                                                            onChange={(e) => setNewTrailer({ ...newTrailer, isRatingDynamic: e.target.checked })}
                                                        />
                                                        Randomize (4.2-4.9)
                                                    </label>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                                        <button
                                            type="button"
                                            className="aud-btn aud-btn-danger"
                                            style={{ width: '100%', fontSize: '11px', padding: '8px' }}
                                            onClick={async () => {
                                                if (confirm('Reset growth timer to start from today? This will reset auto views to Base value.')) {
                                                    const token = localStorage.getItem('token');
                                                    const resp = await fetch(`${API_BASE_URL}/admin/trailers/${currentTrailerId}`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                        body: JSON.stringify({ resetGrowth: true })
                                                    });
                                                    const res = await resp.json();
                                                    if (res.success) {
                                                        alert('Growth counter reset successfully');
                                                        fetchTrailers();
                                                        setShowAddModal(false);
                                                    }
                                                }
                                            }}
                                        >
                                            <Zap size={14} /> Reset Growth / Restart Counter
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="save-btn">
                                    <Video size={16} /> {isEditing ? 'Update Trailer' : 'Add Trailer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Update Modal */}
            {showBulkModal && (
                <div className="modal-overlay">
                    <div className="edit-modal">
                        <div className="modal-header">
                            <h3>Bulk Engagement Control</h3>
                            <button className="close-btn" onClick={() => setShowBulkModal(false)}>
                                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>
                        <form onSubmit={handleBulkSubmit}>
                            <div className="modal-body">
                                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '15px' }}>
                                    Apply these engagement settings to multiple videos at once.
                                </p>

                                <div className="form-group">
                                    <label>Apply To</label>
                                    <select
                                        className="modal-input"
                                        style={{ width: '100%', padding: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '8px' }}
                                        value={bulkSettings.target}
                                        onChange={(e) => setBulkSettings({ ...bulkSettings, target: e.target.value })}
                                    >
                                        <option value="all">All Videos</option>
                                        <option value="category">Selected Category</option>
                                    </select>
                                </div>

                                {bulkSettings.target === 'category' && (
                                    <div className="form-group">
                                        <label>Target Category</label>
                                        <select
                                            className="modal-input"
                                            style={{ width: '100%', padding: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '8px' }}
                                            value={bulkSettings.category}
                                            onChange={(e) => setBulkSettings({ ...bulkSettings, category: e.target.value })}
                                        >
                                            <option value="Trailer">Trailer</option>
                                            <option value="Commercial advertising">Commercial advertising</option>
                                            <option value="Music">Music</option>
                                        </select>
                                    </div>
                                )}

                                <div className="engagement-admin-section">
                                    <h4 className="section-subtitle">Auto Metrics Configuration</h4>

                                    <label className="toggle-label" style={{ marginBottom: '15px' }}>
                                        <input type="checkbox" checked={bulkSettings.autoViewsEnabled} onChange={(e) => setBulkSettings({ ...bulkSettings, autoViewsEnabled: e.target.checked })} />
                                        Enable Auto Views
                                    </label>

                                    {bulkSettings.autoViewsEnabled && (
                                        <div className="engagement-row">
                                            <div className="engagement-col">
                                                <label>Base Views</label>
                                                <input type="number" value={bulkSettings.baseViews} onChange={(e) => setBulkSettings({ ...bulkSettings, baseViews: e.target.value })} />
                                            </div>
                                            <div className="engagement-col">
                                                <label>Daily Increment</label>
                                                <input type="number" value={bulkSettings.dailyIncrement} onChange={(e) => setBulkSettings({ ...bulkSettings, dailyIncrement: e.target.value })} />
                                            </div>
                                        </div>
                                    )}

                                    <label className="toggle-label" style={{ marginBottom: '15px' }}>
                                        <input type="checkbox" checked={bulkSettings.autoLikesEnabled} onChange={(e) => setBulkSettings({ ...bulkSettings, autoLikesEnabled: e.target.checked })} />
                                        Enable Auto Likes
                                    </label>

                                    {bulkSettings.autoLikesEnabled && (
                                        <div className="engagement-row">
                                            <div className="engagement-col">
                                                <label>Like/View Ratio (0.1 - 1.0)</label>
                                                <input type="number" step="0.1" value={bulkSettings.likeRatio} onChange={(e) => setBulkSettings({ ...bulkSettings, likeRatio: e.target.value })} />
                                            </div>
                                        </div>
                                    )}

                                    <label className="toggle-label" style={{ marginBottom: '15px' }}>
                                        <input type="checkbox" checked={bulkSettings.autoRatingEnabled} onChange={(e) => setBulkSettings({ ...bulkSettings, autoRatingEnabled: e.target.checked })} />
                                        Enable Auto Rating
                                    </label>

                                    {bulkSettings.autoRatingEnabled && (
                                        <div className="engagement-row">
                                            <div className="engagement-col">
                                                <label>Star Value</label>
                                                <input type="number" step="0.1" value={bulkSettings.ratingValue} onChange={(e) => setBulkSettings({ ...bulkSettings, ratingValue: e.target.value })} />
                                            </div>
                                            <div className="engagement-col">
                                                <label className="toggle-label" style={{ fontSize: '11px', marginTop: '10px' }}>
                                                    <input type="checkbox" checked={bulkSettings.isRatingDynamic} onChange={(e) => setBulkSettings({ ...bulkSettings, isRatingDynamic: e.target.checked })} />
                                                    Dynamic Range
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="save-btn" style={{ background: '#f59e0b', color: 'black' }}>
                                    <Zap size={16} /> Apply Bulk Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTrailers;
