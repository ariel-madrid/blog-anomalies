import React, { useEffect, useState } from 'react';

const Background: React.FC = () => {
    const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; duration: string }[]>([]);

    useEffect(() => {
        const starCount = 160;
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

            {/* Retro concentric "radar sweep" horizon */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '-45vw',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '110vw',
                    height: '110vw',
                    borderRadius: '50%',
                    background:
                        'repeating-radial-gradient(circle, rgba(53,224,208,0.05) 0px, rgba(53,224,208,0.05) 1px, transparent 1px, transparent 60px)',
                    maskImage: 'radial-gradient(circle, #000 55%, transparent 72%)',
                    WebkitMaskImage: 'radial-gradient(circle, #000 55%, transparent 72%)',
                    opacity: 0.7,
                }}
            />
        </div>
    );
};

export default Background;
