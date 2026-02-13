import React from 'react';
import { Clapperboard, Music, Tv, Star, Eye, ChevronRight } from 'lucide-react';

export const VideoClassification = () => {
    const categories = [
        { title: 'Trailer', icon: <Clapperboard size={24} color="#fff" />, bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' },
        { title: 'Music', icon: <Music size={24} color="#fff" />, bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' },
        { title: 'Commercial advertising', icon: <Tv size={24} color="#fff" />, bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' },
    ];

    return (
        <div className="section-container">
            <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#fff' }}>Video Classification</h3>
            <div className="classification-grid">
                {categories.map((cat, i) => (
                    <div key={i} className="cat-card" style={{ background: cat.bg }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>{cat.icon}</div>
                        <span style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.2' }}>{cat.title}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const VideoCard = ({ video, onClick }) => {
    return (
        <div className="video-card" onClick={() => onClick && onClick(video)}>
            <div className="video-thumb-container">
                <img src={video.thumbnail} alt={video.title} className="video-thumb" />
                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    padding: '4px 8px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#eee',
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {video.views} views</span>
                    <span>{video.duration}</span>
                </div>
            </div>
            <div style={{ padding: '12px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{video.title}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        {Array(5).fill(0).map((_, i) => (
                            <Star key={i} size={12} fill={i < video.stars ? '#fbbf24' : '#444'} color={i < video.stars ? '#fbbf24' : '#444'} />
                        ))}
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{video.points} points</span>
                </div>
                <button style={{
                    width: '100%',
                    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: '#fff',
                    fontSize: '13px',
                    padding: '8px 0',
                    borderRadius: '20px',
                    border: 'none',
                    cursor: 'pointer'
                }} onClick={(e) => {
                    e.stopPropagation(); // prevent double click if card has click
                    if (onClick) onClick(video);
                }}>Rating immediately</button>
            </div>
        </div>
    );
};

export const VideoSection = ({ title, videos, onVideoClick }) => {
    return (
        <div className="section-container">
            <div className="video-section-header">
                <h3 style={{ fontSize: '18px', color: '#fff' }}>{title}</h3>
                <div style={{
                    width: '28px',
                    height: '28px',
                    background: '#8b5cf6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                }}>
                    <ChevronRight size={18} color="#fff" />
                </div>
            </div>
            <div className="video-grid">
                {videos.map((v) => (
                    <VideoCard key={v._id || v.id} video={v} onClick={onVideoClick} />
                ))}
            </div>
        </div>
    );
};
