"use client";

import { useEffect, useState } from "react";

interface Particle {
    id: number;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    delay: number;
}

interface ParticleEffectProps {
    trigger: boolean;
    onComplete?: () => void;
    originX?: number; // 시작 위치 X (% 단위)
    originY?: number; // 시작 위치 Y (% 단위)
}

export default function ParticleEffect({
    trigger,
    onComplete,
    originX = 50,
    originY = 50
}: ParticleEffectProps) {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (trigger && !isAnimating) {
            setIsAnimating(true);

            // 8개의 입자를 4개 구석으로 분산
            const corners = [
                { x: 10, y: 10 },    // 왼쪽 상단
                { x: 90, y: 10 },    // 오른쪽 상단
                { x: 10, y: 90 },    // 왼쪽 하단
                { x: 90, y: 90 },    // 오른쪽 하단
            ];

            const newParticles: Particle[] = [];

            for (let i = 0; i < 8; i++) {
                const corner = corners[i % 4];
                newParticles.push({
                    id: i,
                    x: originX,
                    y: originY,
                    targetX: corner.x + (Math.random() - 0.5) * 10, // 약간의 랜덤성
                    targetY: corner.y + (Math.random() - 0.5) * 10,
                    delay: i * 50, // 순차적 발사
                });
            }

            setParticles(newParticles);

            // 애니메이션 완료 후 정리
            setTimeout(() => {
                setParticles([]);
                setIsAnimating(false);
                onComplete?.();
            }, 1000);
        }
    }, [trigger, isAnimating, onComplete, originX, originY]);

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
                        background: "rgba(255, 255, 255, 0.9)",
                        boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
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
