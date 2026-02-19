import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VideoCard } from '../components/VideoComponents';
import { VIDEOS } from '../mockData';
import MessagePopup from '../components/MessagePopup';
import TaskRequirementPopup from '../components/TaskRequirementPopup';
import RatingPopup from '../components/RatingPopup';
import AnimatedCounter from '../components/AnimatedCounter';
import API_BASE_URL from '../apiConfig';
import './VideoDetail.css';

const VideoDetail = ({ video, onBack, onVideoClick }) => {
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userPackages, setUserPackages] = useState([]);
    const [popup, setPopup] = useState({ isOpen: false, message: '', type: 'info' });
    const [showRequirementPopup, setShowRequirementPopup] = useState(false);
    const [showRatingPopup, setShowRatingPopup] = useState(false);
    const [activeTask, setActiveTask] = useState(null);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
        setIsPlaying(false);
        fetchUserTasks();
    }, [video]);

    const fetchUserTasks = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUserPackages([]);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUserPackages(data.data);
            } else {
                setUserPackages([]);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setUserPackages([]);
        }
    };

    if (!video) return <div>Loading...</div>;

    const getEmbedUrl = (url) => {
        if (!url) return '';
        if (url.includes('youtube.com/watch?v=')) {
            const id = url.split('v=')[1]?.split('&')[0];
            return `https://www.youtube.com/embed/${id}?autoplay=1`;
        }
        if (url.includes('youtu.be/')) {
            const id = url.split('.be/')[1]?.split('?')[0];
            return `https://www.youtube.com/embed/${id}?autoplay=1`;
        }
        return url;
    };

    const recommendations = VIDEOS.filter(v => v.id !== video.id).slice(0, 4);

    const showMsg = (message, type = 'info') => {
        setPopup({ isOpen: true, message, type });
    };

    const handleScoreClick = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            showMsg('Please login first', 'warning');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        // Check if there's any active package with tasks remaining
        const activePackages = userPackages.filter(p => p.status === 'active');
        const availablePackage = activePackages.find(p => !p.isCompleted);

        if (!availablePackage) {
            if (activePackages.length > 0) {
                showMsg('Today\'s tasks are completed. Please come back tomorrow!', 'info');
            } else {
                const pendingPackage = userPackages.find(p => p.status === 'pending');
                if (pendingPackage) {
                    showMsg('Your VIP package is pending approval. Please wait for activation.', 'info');
                } else {
                    setShowRequirementPopup(true);
                }
            }
            return;
        }

        // Instead of immediate complete, show the rating stars
        setActiveTask(availablePackage);
        setShowRatingPopup(true);
    };

    const handleRateSubmit = async (stars) => {
        if (!activeTask) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/tasks/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userPackageId: activeTask.userPackageId,
                    rating: stars,
                    trailerId: video?._id,
                    videoTitle: video?.title
                })
            });

            const data = await response.json();

            if (data.success) {
                setShowRatingPopup(false);
                showMsg(`Rated ${stars} stars! Earned ${data.data.earning} USDT`, 'success');
                fetchUserTasks(); // Refresh tasks
            } else {
                showMsg(data.message || 'Failed to complete task', 'error');
            }
        } catch (error) {
            console.error('Task error:', error);
            showMsg('Network error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="video-detail-container">
            <div className="app-top-nav" style={{ padding: '16px', marginBottom: '0' }}>
                <button className="back-btn-circle" onClick={onBack}>
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="video-hero-wrapper">
                {isPlaying ? (
                    <div className="video-player-container" style={{ width: '100%', aspectRatio: '16/9' }}>
                        <iframe
                            width="100%"
                            height="100%"
                            src={getEmbedUrl(video.videoUrl)}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : (
                    <div
                        className="thumbnail-placeholder"
                        onClick={() => setIsPlaying(true)}
                        style={{ cursor: 'pointer', width: '100%', height: '100%', position: 'relative' }}
                    >
                        <img src={video.thumbnail} alt={video.title} className="video-hero-image" />
                        <div className="play-overlay">
                            <div className="play-btn-circle">
                                <Play size={24} fill="white" color="white" style={{ marginLeft: '4px' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="detail-info-section">
                <h1 className="detail-title">{video.title}</h1>

                <button
                    className="score-btn"
                    onClick={handleScoreClick}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Score to get income'}
                </button>

                <div className="meta-info">
                    <div className="engagement-stats-bar">
                        <div className="stat-item">
                            <span className="stat-val">
                                <AnimatedCounter end={video.rawViews} />
                            </span>
                            <span className="stat-label">Views</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-val">
                                <AnimatedCounter end={video.rawLikes} />
                            </span>
                            <span className="stat-label">Likes</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-val">{video.stars}</span>
                            <span className="stat-label">Rating</span>
                        </div>
                    </div>

                    <div className="meta-row">
                        <span className="meta-label">Type:</span>
                        <span className="meta-val">{video.category || 'Trailer'}</span>
                    </div>
                    <div className="meta-row">
                        <span className="meta-label">Total Points:</span>
                        <span className="meta-val" style={{ color: '#fbbf24' }}>{video.points}</span>
                    </div>
                    <div className="meta-row">
                        <span className="meta-label">Description:</span>
                        <span className="meta-val">Rate the trailer to earn income. All metrics (views, likes) are automatically optimized for platform engagement.</span>
                    </div>
                </div>

                <div className="recommendation-header">
                    <ThumbsUp size={20} className="thumb-icon" fill="#f472b6" />
                    <span className="rec-title">Related Recommendations</span>
                </div>

                <div className="rec-grid">
                    {recommendations.map(rec => (
                        <VideoCard key={rec.id} video={rec} onClick={onVideoClick} />
                    ))}
                </div>
            </div>

            {/* General Message Popup */}
            <MessagePopup
                isOpen={popup.isOpen}
                message={popup.message}
                type={popup.type}
                onClose={() => setPopup({ ...popup, isOpen: false })}
            />

            {/* Requirement Restricted Popup */}
            <TaskRequirementPopup
                isOpen={showRequirementPopup}
                onClose={() => setShowRequirementPopup(false)}
                amount={8}
            />

            {/* Star Rating Popup */}
            <RatingPopup
                isOpen={showRatingPopup}
                onClose={() => setShowRatingPopup(false)}
                onRate={handleRateSubmit}
                loading={loading}
            />
        </div>
    );
};

export default VideoDetail;
