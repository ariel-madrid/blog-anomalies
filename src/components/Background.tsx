import React, { useEffect, useState } from 'react';

const Background: React.FC = () => {
    const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; duration: string }[]>([]);

    useEffect(() => {
        const starCount = 150;
        const newStars = Array.from({ length: starCount }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: `${Math.random() * 2 + 1}px`,
            duration: `${Math.random() * 3 + 2}s`,
        }));
        setStars(newStars);
    }, []);

    return (
        <div className="space-background">
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="star"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        // @ts-ignore
                        '--duration': star.duration,
                    }}
                />
            ))}
            <div
                style={{
                    position: 'absolute',
                    top: '20%',
                    right: '10%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '5%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(255, 77, 0, 0.05) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />
        </div>
    );
};

export default Background;
