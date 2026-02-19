import React, { useState, useEffect } from 'react';

const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        const startValue = 0;

        // Handle the K/M format if passed as string, but we want raw numbers for animation
        // However, if the parent passes formatted string, we might struggle.
        // Let's assume parent passes rawValue.
        const endValue = Number(end) || 0;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * (endValue - startValue) + startValue));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [end, duration]);

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <span className="animated-counter">
            {prefix}{formatNumber(count)}{suffix}
        </span>
    );
};

export default AnimatedCounter;
