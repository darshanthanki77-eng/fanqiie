import React from 'react';
import { PlayCircle } from 'lucide-react';

const HeroBanner = () => {
    return (
        <div className="section-container hero-banner-wrapper">
            <div className="hero-banner">
                <div className="hero-content">
                    <div className="hero-brand-badge">
                        <PlayCircle size={16} fill="#ff4d4d" /> TOMATO TV
                    </div>
                    <h2 className="hero-title">
                        Join the Future of <span className="hero-title-highlight">Video Earning</span>
                    </h2>
                    <p className="hero-description">
                        Watch, Rate, and Earn rewards daily.
                    </p>
                    <button className="hero-cta-btn">Start Earning</button>
                </div>
                <div className="hero-image-container">
                    <div className="mascot-ring">
                        <img
                            src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=60"
                            alt="Tomato Mascot"
                            className="hero-mascot"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;
