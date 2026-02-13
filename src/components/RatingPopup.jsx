import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import './RatingPopup.css';

const RatingPopup = ({ isOpen, onClose, onRate, loading }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (rating === 0) return;
        onRate(rating);
    };

    return (
        <div className="rating-popup-overlay" onClick={onClose}>
            <div className="rating-popup-content" onClick={e => e.stopPropagation()}>
                <button className="rating-popup-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="rating-popup-header">
                    <h3>Rate Trailer</h3>
                    <p>Give your rating to earn task income</p>
                </div>

                <div className="star-rating-box">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={42}
                            className={`star-icon ${(hover || rating) >= star ? 'active' : ''}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            fill={(hover || rating) >= star ? '#f59e0b' : 'none'}
                        />
                    ))}
                </div>

                <div className="rating-feedback-text">
                    {rating > 0 ? `You selected ${rating} stars` : 'Please select a rating'}
                </div>

                <button
                    className={`rating-submit-btn ${rating === 0 || loading ? 'disabled' : ''}`}
                    onClick={handleSubmit}
                    disabled={rating === 0 || loading}
                >
                    {loading ? 'Submitting...' : 'Submit Rating'}
                </button>
            </div>
        </div>
    );
};

export default RatingPopup;
