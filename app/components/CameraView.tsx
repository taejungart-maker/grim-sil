"use client";

import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import ParticleEffect from "./ParticleEffect";
import CaptureCompleteButton from "./CaptureCompleteButton";
import { saveInspiration, updateInspirationMetadata } from "../utils/inspirationStorage";
import { ARTIST_ID } from "../utils/supabase";

interface CameraViewProps {
    onClose: () => void;
    onArchiveClick: () => void;
    onCaptureComplete: () => void;
}

export default function CameraView({ onClose, onArchiveClick, onCaptureComplete }: CameraViewProps) {
    const webcamRef = useRef<Webcam>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const [isCameraReady, setIsCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [triggerParticles, setTriggerParticles] = useState(false);
    const [showFlash, setShowFlash] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [capturedInspirationId, setCapturedInspirationId] = useState<string | null>(null);
    const [particleColors, setParticleColors] = useState<string[]>([]);
    const [memo, setMemo] = useState("");
    const [isMemoSaving, setIsMemoSaving] = useState(false);
    const [showMemoUI, setShowMemoUI] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // AudioContext 초기화
    useEffect(() => {
        if (typeof window !== "undefined") {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }, []);

    const playShutterSound = async () => {
        if (!audioContextRef.current) return;
        try {
            await audioContextRef.current.resume();
            const oscillator = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);
            oscillator.frequency.value = 800;
            oscillator.type = "sine";
            gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);
            oscillator.start(audioContextRef.current.currentTime);
            oscillator.stop(audioContextRef.current.currentTime + 0.1);
        } catch (error) {
            console.error("Failed to play shutter sound:", error);
        }
    };

    const processImageCapture = async (imageSrc: string) => {
        try {
            await playShutterSound();
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 200);

            const result = await saveInspiration(imageSrc, ARTIST_ID);

            if (result.success && result.inspirationId) {
                setTriggerParticles(true);
                setCapturedInspirationId(result.inspirationId);
                setTimeout(() => {
                    setTriggerParticles(false);
                    setShowMemoUI(true);
                }, 800);
            } else {
                alert(`❌ 저장 실패: ${result.error || "알 수 없는 오류"}`);
            }
        } catch (error) {
            console.error("Capture error:", error);
            alert("영감 채집 중 오류가 발생했습니다.");
        }
    };

    const handleCaptureClick = async () => {
        if (isProcessing || !isCameraReady || showMemoUI) return;
        setIsProcessing(true);
        try {
            const imageSrc = webcamRef.current?.getScreenshot();
            if (!imageSrc) {
                alert("카메라에서 이미지를 캡처할 수 없습니다.");
                return;
            }
            await processImageCapture(imageSrc);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMemoSubmit = async () => {
        if (!capturedInspirationId || isMemoSaving) return;
        setIsMemoSaving(true);
        try {
            await updateInspirationMetadata(capturedInspirationId, ARTIST_ID, memo);
            setShowMemoUI(false);
            onCaptureComplete();
        } catch (error) {
            console.error("Failed to save memo:", error);
        } finally {
            setIsMemoSaving(false);
        }
    };

    const handleCameraError = (error: string | DOMException) => {
        console.error("Camera error:", error);
        setCameraError("카메라를 불러올 수 없습니다. 권한을 확인해 주세요.");
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            fontFamily: "'Noto Sans KR', sans-serif"
        }}>
            {/* 상단 버튼 그룹 */}
            <div style={{
                position: "absolute",
                top: "calc(20px + env(safe-area-inset-top))",
                left: "20px",
                right: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 100
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(10px)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "10px 20px",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                    }}
                >
                    ✕ Close
                </button>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={() => setShowHelp(true)}
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(10px)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.2)",
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            fontSize: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        ?
                    </button>

                    <button
                        onClick={onArchiveClick}
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(10px)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.2)",
                            padding: "10px 20px",
                            borderRadius: "50px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 600
                        }}
                    >
                        Archive →
                    </button>
                </div>
            </div>

            {!cameraError && (
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                        facingMode: "environment",
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    }}
                    onUserMedia={() => setIsCameraReady(true)}
                    onUserMediaError={handleCameraError}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: showMemoUI ? "blur(20px) grayscale(50%)" : "none",
                        transition: "filter 0.5s ease"
                    }}
                />
            )}

            {cameraError && (
                <div style={{ color: "#fff", textAlign: "center", padding: "20px", zIndex: 10 }}>
                    <p>{cameraError}</p>
                </div>
            )}

            {showFlash && (
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "#fff",
                    zIndex: 100,
                }} />
            )}

            {!cameraError && !showMemoUI && (
                <button
                    onClick={handleCaptureClick}
                    disabled={!isCameraReady || isProcessing}
                    style={{
                        position: "relative",
                        zIndex: 10,
                        width: "84px",
                        height: "84px",
                        borderRadius: "50%",
                        border: "4px solid rgba(255, 255, 255, 0.9)",
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "transform 0.2s"
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                    <div style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: isProcessing ? "rgba(255,255,255,0.3)" : "rgba(255, 255, 255, 0.85)",
                    }} />
                </button>
            )}

            {/* 미니멀 메모 입력 UI */}
            {showMemoUI && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 500,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.4)",
                    padding: "24px"
                }}>
                    <div style={{
                        width: "100%",
                        maxWidth: "400px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "24px",
                        animation: "slideUp 0.4s ease-out"
                    }}>
                        <textarea
                            placeholder="지금 이 영감을 한 줄로 기록해 보세요..."
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            autoFocus
                            style={{
                                width: "100%",
                                background: "transparent",
                                border: "none",
                                borderBottom: "2px solid rgba(255,255,255,0.4)",
                                color: "#fff",
                                fontSize: "20px",
                                padding: "12px 0",
                                textAlign: "center",
                                outline: "none",
                                resize: "none",
                                fontWeight: 300,
                                fontFamily: "'Noto Sans KR', sans-serif"
                            }}
                        />
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button
                                onClick={handleMemoSubmit}
                                disabled={isMemoSaving}
                                style={{
                                    background: "#fff",
                                    color: "#000",
                                    border: "none",
                                    padding: "16px 40px",
                                    borderRadius: "100px",
                                    fontWeight: 700,
                                    fontSize: "15px",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                {isMemoSaving ? "Saving..." : "Done"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ParticleEffect trigger={triggerParticles} colors={particleColors.length > 0 ? particleColors : undefined} />

            {capturedInspirationId && (
                <CaptureCompleteButton inspirationId={capturedInspirationId} />
            )}

            {!showMemoUI && (
                <div style={{
                    position: "absolute",
                    bottom: "calc(40px + env(safe-area-inset-bottom))",
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: "12px",
                    textAlign: "center",
                    letterSpacing: "0.2em",
                    fontWeight: 400
                }}>
                    {isProcessing ? "CAPTURING..." : "TAP TO COLLECT INSPIRATION"}
                </div>
            )}

            {/* 도움말 모달 */}
            {showHelp && (
                <div
                    onClick={() => setShowHelp(false)}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.85)",
                        zIndex: 1000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "30px",
                        animation: "fadeIn 0.3s ease-out"
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            color: "#000",
                            maxWidth: "400px",
                            width: "100%",
                            padding: "40px 30px",
                            borderRadius: "32px",
                            position: "relative",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
                        }}
                    >
                        <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Studio 가이드</h2>
                        <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "16px" }}>
                            <li>
                                <strong style={{ display: "block", fontSize: "14px", color: "#6366f1", marginBottom: "4px" }}>1. 채집</strong>
                                <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.6", color: "#444" }}>중앙의 셔터 버튼을 눌러 지금 이 순간의 영감을 사진으로 담으세요.</p>
                            </li>
                            <li>
                                <strong style={{ display: "block", fontSize: "14px", color: "#6366f1", marginBottom: "4px" }}>2. 기록</strong>
                                <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.6", color: "#444" }}>촬영 직후 나타나는 메모창에 영감의 짧은 조각을 남기세요.</p>
                            </li>
                            <li>
                                <strong style={{ display: "block", fontSize: "14px", color: "#6366f1", marginBottom: "4px" }}>3. 아카이브</strong>
                                <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.6", color: "#444" }}>작업실 아카이브에서 작가님만이 수집한 영감들을 모아볼 수 있습니다.</p>
                            </li>
                        </ul>
                        <button
                            onClick={() => setShowHelp(false)}
                            style={{
                                width: "100%",
                                marginTop: "32px",
                                padding: "16px",
                                background: "#222",
                                color: "#fff",
                                border: "none",
                                borderRadius: "16px",
                                fontWeight: 600,
                                cursor: "pointer"
                            }}
                        >
                            알겠습니다
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
}
