import React, { useState, useEffect } from 'react';
import { PlayCircle } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

const HeroBanner = () => {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/banners`);
                const data = await response.json();
                if (data.success && data.data.length > 0) {
                    setBanners(data.data);
                }
            } catch (error) {
                console.error('Error fetching banners:', error);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;

        const currentBanner = banners[currentIndex];
        if (currentBanner && currentBanner.autoSlide === false) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [banners, currentIndex]);

    if (banners.length === 0) {
        // Fallback to static design if no banners setup
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
                </div>
            </div>
        );
    }

    const currentBanner = banners[currentIndex];

    return (
        <div className="section-container hero-banner-wrapper">
            <div className="hero-slider-content">
                <div className="hero-banner" key={currentBanner._id}>
                    <div className="hero-content">
                        <div className="hero-brand-badge">
                            <PlayCircle size={16} fill="#ff4d4d" /> TOMATO TV
                        </div>
                        <h2 className="hero-title">
                            {currentBanner.title}
                        </h2>
                        <p className="hero-description">
                            {currentBanner.description}
                        </p>
                        {currentBanner.link && (
                            <button
                                className="hero-cta-btn"
                                onClick={() => window.location.href = currentBanner.link}
                            >
                                Get Started
                            </button>
                        )}
                    </div>
                    <div className="hero-image-container">
                        <div className="mascot-ring">
                            <img
                                src={currentBanner.image}
                                alt={currentBanner.title}
                                className="hero-mascot"
                                style={{ borderRadius: '12px' }}
                            />
                        </div>
                    </div>
                </div>

                {banners.length > 1 && (
                    <div className="slider-dots">
                        {banners.map((_, idx) => (
                            <div
                                key={idx}
                                className={`slider-dot ${idx === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(idx)}
                            ></div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeroBanner;

