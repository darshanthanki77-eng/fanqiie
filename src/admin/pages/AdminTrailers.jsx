import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Play, Video, Edit2 } from 'lucide-react';
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
        category: 'Trailer'
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
        setNewTrailer({ title: '', thumbnail: '', videoUrl: '', duration: '0:00', category: 'Trailer' });
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
            category: trailer.category
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

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="admin-page-header">
                <button className="back-btn-circle" onClick={() => navigate('/admin/dashboard')}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="page-title">Manage Trailers</h2>
                <button className="add-btn-admin" onClick={handleAddClick}>
                    <Plus size={20} />
                </button>
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
                                    <label>Duration</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTrailer.duration}
                                        onChange={(e) => setNewTrailer({ ...newTrailer, duration: e.target.value })}
                                        placeholder="e.g. 2:30"
                                    />
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
        </div>
    );
};

export default AdminTrailers;
