import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, User, Calendar, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../apiConfig';
import './AdminRatings.css';

const AdminRatings = () => {
    const navigate = useNavigate();
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRatings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/ratings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setRatings(data.data);
            }
        } catch (error) {
            console.error('Error fetching ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRatings();
    }, []);

    const renderStars = (count) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={16}
                fill={i < count ? "#f59e0b" : "transparent"}
                color={i < count ? "#f59e0b" : "#4b5563"}
            />
        ));
    };

    return (
        <div className="admin-ratings-container">
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="header-title">User Ratings</h1>
                <button className="refresh-btn" onClick={fetchRatings}>
                    <RefreshCcw size={20} />
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Loading ratings...</div>
            ) : ratings.length > 0 ? (
                <div className="ratings-table-wrapper">
                    <table className="ratings-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Rating</th>
                                <th>Task Title</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ratings.map((rating) => (
                                <tr key={rating._id}>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="user-icon-bg">
                                                <User size={14} />
                                            </div>
                                            <span className="user-email">{rating.user?.email || rating.user?.mobile || 'Unknown User'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="stars-cell">
                                            {renderStars(rating.stars)}
                                            <span className="stars-count">({rating.stars})</span>
                                        </div>
                                    </td>
                                    <td>{rating.videoTitle || 'Trailer Task'}</td>
                                    <td>
                                        <div className="date-cell">
                                            <Calendar size={12} />
                                            <span>{new Date(rating.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">No ratings found yet.</div>
            )}
        </div>
    );
};

export default AdminRatings;
