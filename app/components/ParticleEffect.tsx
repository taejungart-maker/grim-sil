"use client";

import { useEffect, useState } from "react";

interface Particle {
    id: number;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    delay: number;
    color: string;
}

interface ParticleEffectProps {
    trigger: boolean;
    onComplete?: () => void;
    originX?: number;
    originY?: number;
    colors?: string[];
    direction?: 'corners' | 'bottomRight';
}

export default function ParticleEffect({
    trigger,
    onComplete,
    originX = 50,
    originY = 50,
    colors = ['rgba(255, 255, 255, 0.9)'],
    direction = 'corners'
}: ParticleEffectProps) {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (trigger && !isAnimating) {
            setIsAnimating(true);

            let targets: { x: number; y: number }[] = [];

            if (direction === 'bottomRight') {
                // 우측 하단으로 집중
                targets = [
                    { x: 85, y: 80 },
                    { x: 90, y: 85 },
                    { x: 88, y: 82 },
                    { x: 92, y: 88 },
                ];
            } else {
                // 4개 구석으로 분산
                targets = [
                    { x: 10, y: 10 },
                    { x: 90, y: 10 },
                    { x: 10, y: 90 },
                    { x: 90, y: 90 },
                ];
            }

            const newParticles: Particle[] = [];

            for (let i = 0; i < 8; i++) {
                const target = targets[i % targets.length];
                newParticles.push({
                    id: i,
                    x: originX,
                    y: originY,
                    targetX: target.x + (Math.random() - 0.5) * 5,
                    targetY: target.y + (Math.random() - 0.5) * 5,
                    delay: i * 50,
                    color: colors[i % colors.length],
                });
            }

            setParticles(newParticles);

            setTimeout(() => {
                setParticles([]);
                setIsAnimating(false);
                onComplete?.();
            }, 1000);
        }
    }, [trigger, isAnimating, onComplete, originX, originY, direction, colors]);

    if (particles.length === 0) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 9999,
            }}
        >
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    style={{
                        position: "absolute",
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: particle.color,
                        boxShadow: `0 0 10px ${particle.color}`,
                        transform: "translate(-50%, -50%)",
                        animation: `particleFly-${particle.id} 800ms cubic-bezier(0.4, 0, 0.2, 1) ${particle.delay}ms forwards`,
                    }}
                >
                    <style jsx>{`
            @keyframes particleFly-${particle.id} {
              0% {
                left: ${particle.x}%;
                top: ${particle.y}%;
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
              100% {
                left: ${particle.targetX}%;
                top: ${particle.targetY}%;
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.3);
              }
            }
          `}</style>
                </div>
            ))}
        </div>
    );
}
