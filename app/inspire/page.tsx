"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";
import ParticleEffect from "../components/ParticleEffect";
import CaptureCompleteButton from "../components/CaptureCompleteButton";
import { saveInspiration } from "../utils/inspirationStorage";
import { ARTIST_ID } from "../utils/supabase";

export default function InspirationCapturePage() {
    const router = useRouter();
    const webcamRef = useRef<Webcam>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const [isCameraReady, setIsCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [cameraErrorCode, setCameraErrorCode] = useState<string | null>(null); // 상세 에러 코드
    const [triggerParticles, setTriggerParticles] = useState(false);
    const [showFlash, setShowFlash] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [capturedInspirationId, setCapturedInspirationId] = useState<string | null>(null);
    const [particleColors, setParticleColors] = useState<string[]>([]);

    // AudioContext 초기화
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }, []);

    // 찰칵 소리 재생 함수
    const playShutterSound = async () => {
        if (!audioContextRef.current) return;

        try {
            // Autoplay Policy 대응: 사용자 제스처에서 resume 필요
            await audioContextRef.current.resume();

            const oscillator = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);

            oscillator.start(audioContextRef.current.currentTime);
            oscillator.stop(audioContextRef.current.currentTime + 0.1);
        } catch (error) {
            console.error('Failed to play shutter sound:', error);
        }
    };

    // 📸 파일에서 이미지 처리 (공통 로직)
    const processImageCapture = async (imageSrc: string) => {
        try {
            // 1. 찰칵 소리 재생
            await playShutterSound();

            // 2. 플래시 효과
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 200);

            // 3. 영감 저장 (로컬 + 서버)
            const result = await saveInspiration(imageSrc, ARTIST_ID);

            if (result.success && result.inspirationId) {
                // 4. 입자 효과 트리거
                setTriggerParticles(true);
                setCapturedInspirationId(result.inspirationId);

                setTimeout(() => setTriggerParticles(false), 100);

                // 로컬 저장 성공 시 항상 성공 토스트 표시
                setTimeout(() => {
                    const toast = document.createElement('div');
                    toast.textContent = '✨ 영감이 성공적으로 채집되었습니다!';
                    toast.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: rgba(0, 0, 0, 0.9);
                        color: white;
                        padding: 20px 40px;
                        border-radius: 16px;
                        font-size: 16px;
                        font-weight: 600;
                        z-index: 10000;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                        animation: fadeInOut 2s ease-in-out;
                    `;
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 2000);
                }, 300);

                // 서버 실패는 콘솔에만 기록
                if (result.error) {
                    console.warn('⚠️ Server upload failed (local save successful):', result.error);
                }
            } else {
                alert(`❌ 저장 실패: ${result.error || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Capture error:', error);
            alert('영감 채집 중 오류가 발생했습니다.');
        }
    };

    // 셔터 버튼 클릭: 카메라 캡처
    const handleCaptureClick = async () => {
        if (isTransitioning || isProcessing || !isCameraReady) return;

        setIsProcessing(true);

        try {
            const imageSrc = webcamRef.current?.getScreenshot();

            if (!imageSrc) {
                alert('카메라에서 이미지를 캡처할 수 없습니다.');
                setIsProcessing(false);
                return;
            }

            await processImageCapture(imageSrc);
        } finally {
            setIsProcessing(false);
        }
    };

    // 📁 파일 업로드 핸들러
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 📊 파일 메타데이터 로깅
        console.log('📁 File selected:');
        console.log('  - Name:', file.name);
        console.log('  - Size:', file.size, 'bytes');
        console.log('  - Type:', file.type);

        setIsProcessing(true);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const imageSrc = e.target?.result as string;
                if (imageSrc) {
                    console.log('✅ File converted to Base64, length:', imageSrc.length);
                    await processImageCapture(imageSrc);
                } else {
                    console.error('❌ Failed to convert file to Base64');
                    alert('파일 변환에 실패했습니다.');
                }
                setIsProcessing(false);
            };
            reader.onerror = (error) => {
                console.error('❌ FileReader error:', error);
                alert('파일 읽기 중 오류가 발생했습니다.');
                setIsProcessing(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('File upload error:', error);
            alert('파일 업로드 중 오류가 발생했습니다.');
            setIsProcessing(false);
        }
    };

    // 🧪 테스트 더미 이미지 업로드
    const handleDummyImageUpload = async () => {
        setIsProcessing(true);

        try {
            // 1x1 px 회색 이미지 (Base64)
            const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            await processImageCapture(dummyImage);
        } finally {
            setIsProcessing(false);
        }
    };

    // 카메라 에러 핸들러
    const handleCameraError = (error: string | DOMException) => {
        console.error('Camera error:', error);
        const errorMessage = typeof error === 'string' ? error : error.message;
        const errorName = typeof error === 'object' && 'name' in error ? error.name : 'Unknown';

        // 상세 에러 코드 저장
        setCameraErrorCode(errorName);

        if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
            setCameraError('카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
        } else if (errorMessage.includes('NotFoundError')) {
            setCameraError('카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.');
        } else {
            setCameraError('카메라를 시작할 수 없습니다. 다른 앱에서 카메라를 사용 중인지 확인해주세요.');
        }
    };

    // 배경 클릭: 아카이브로 이동
    const handleBackgroundClick = () => {
        if (isTransitioning || isProcessing) return;

        setIsTransitioning(true);

        setTimeout(() => {
            router.push("/archive");
        }, 300);
    };

    return (
        <div
            onClick={handleBackgroundClick}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "opacity 300ms ease-out",
                opacity: isTransitioning ? 0 : 1,
                overflow: "hidden",
            }}
        >
            {/* 카메라 스트림 */}
            {!cameraError && (
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                        facingMode: "environment", // 후면 카메라 우선
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    }}
                    onUserMedia={() => {
                        setIsCameraReady(true);
                        setCameraError(null);
                    }}
                    onUserMediaError={handleCameraError}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            )}

            {/* 카메라 권한 에러 안내 */}
            {cameraError && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: "relative",
                        zIndex: 10,
                        maxWidth: "450px",
                        padding: "32px 24px",
                        background: "rgba(20, 20, 20, 0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        textAlign: "center",
                        color: "#fff",
                    }}
                >
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📷</div>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
                        카메라를 연결할 수 없습니다
                    </h2>
                    <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(255, 255, 255, 0.8)", marginBottom: "12px" }}>
                        {cameraError}
                    </p>

                    {/* 상세 에러 코드 표시 */}
                    {cameraErrorCode && (
                        <div style={{
                            background: "rgba(255, 77, 77, 0.15)",
                            border: "1px solid rgba(255, 77, 77, 0.3)",
                            borderRadius: "8px",
                            padding: "12px",
                            marginBottom: "20px",
                        }}>
                            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "4px" }}>에러 코드</div>
                            <div style={{ fontSize: "16px", fontWeight: 700, color: "#ff4d4d", fontFamily: "monospace" }}>
                                {cameraErrorCode}
                            </div>
                        </div>
                    )}

                    <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6, marginBottom: "24px" }}>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>모바일:</strong> 설정 → Safari/Chrome → 카메라 권한 허용
                        </p>
                        <p>
                            <strong>데스크톱:</strong> 브라우저 주소창 왼쪽 아이콘 → 카메라 허용
                        </p>
                    </div>

                    {/* 대체 옵션 버튼들 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: "12px 24px",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            🔄 다시 시도
                        </button>

                        <label
                            style={{
                                padding: "12px 24px",
                                background: "rgba(102, 126, 234, 0.2)",
                                border: "1px solid rgba(102, 126, 234, 0.4)",
                                color: "#fff",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "block",
                            }}
                        >
                            📁 파일에서 사진 선택
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                style={{ display: "none" }}
                            />
                        </label>

                        <button
                            onClick={handleDummyImageUpload}
                            disabled={isProcessing}
                            style={{
                                padding: "12px 24px",
                                background: "rgba(255, 165, 0, 0.2)",
                                border: "1px solid rgba(255, 165, 0, 0.4)",
                                color: "#ffa500",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: isProcessing ? "not-allowed" : "pointer",
                                opacity: isProcessing ? 0.5 : 1,
                            }}
                        >
                            🧪 테스트 이미지로 시험하기
                        </button>
                    </div>
                </div>
            )}

            {/* 플래시 효과 */}
            {showFlash && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "#fff",
                        zIndex: 100,
                        animation: "flash 200ms ease-out",
                    }}
                />
            )}

            {/* 중앙 셔터 버튼 */}
            {!cameraError && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCaptureClick();
                    }}
                    disabled={!isCameraReady || isProcessing}
                    style={{
                        position: "relative",
                        zIndex: 10,
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        border: "3px solid rgba(255, 255, 255, 0.9)",
                        background: isProcessing
                            ? "rgba(100, 100, 100, 0.3)"
                            : "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        cursor: isCameraReady && !isProcessing ? "pointer" : "not-allowed",
                        transition: "all 200ms ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                        if (isCameraReady && !isProcessing) {
                            e.currentTarget.style.transform = "scale(1.1)";
                            e.currentTarget.style.boxShadow = "0 6px 30px rgba(0, 0, 0, 0.4)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
                    }}
                    onMouseDown={(e) => {
                        if (isCameraReady && !isProcessing) {
                            e.currentTarget.style.transform = "scale(0.95)";
                        }
                    }}
                    onMouseUp={(e) => {
                        if (isCameraReady && !isProcessing) {
                            e.currentTarget.style.transform = "scale(1.1)";
                        }
                    }}
                    aria-label="영감 채집"
                >
                    <div
                        style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: isProcessing
                                ? "rgba(100, 100, 100, 0.5)"
                                : "rgba(255, 255, 255, 0.8)",
                            transition: "all 200ms ease",
                        }}
                    />
                </button>
            )}

            {/* 입자 효과 */}
            <ParticleEffect
                trigger={triggerParticles}
                colors={particleColors.length > 0 ? particleColors : undefined}
                direction="bottomRight"
            />

            {/* 채집 완료 버튼 */}
            {capturedInspirationId && (
                <CaptureCompleteButton inspirationId={capturedInspirationId} />
            )}

            {/* 하단 힌트 텍스트 */}
            {!cameraError && (
                <>
                    <div
                        style={{
                            position: "absolute",
                            bottom: "40px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            color: "rgba(255, 255, 255, 0.9)",
                            fontSize: "14px",
                            fontWeight: 300,
                            letterSpacing: "0.05em",
                            pointerEvents: "none",
                            textAlign: "center",
                            zIndex: 5,
                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                        }}
                    >
                        <div>{isProcessing ? "처리 중..." : isCameraReady ? "영감 채집" : "카메라 준비 중..."}</div>
                        {isCameraReady && !isProcessing && (
                            <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
                                배경을 클릭하여 갤러리로 이동
                            </div>
                        )}
                    </div>

                    {/* 📁 파일 업로드 버튼 (우측 하단) */}
                    <label
                        style={{
                            position: "absolute",
                            bottom: "40px",
                            right: "40px",
                            zIndex: 10,
                            padding: "12px 20px",
                            background: "rgba(0, 0, 0, 0.7)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "50px",
                            color: "#fff",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 300ms ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(102, 126, 234, 0.9)";
                            e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    >
                        📁 파일 선택
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                        />
                    </label>
                </>
            )}

            <style jsx>{`
                @keyframes flash {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                }
            `}</style>
        </div>
    );
}
