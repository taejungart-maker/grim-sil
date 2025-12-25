"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { addArtwork, uploadImageToStorage } from "../utils/db";
import { loadSettings } from "../utils/settingsDb";

export default function AddArtworkPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState<number | undefined>(new Date().getMonth() + 1);
    const [dimensions, setDimensions] = useState("");
    const [medium, setMedium] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [artistName, setArtistName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 대표 작가노트 및 작가 이름 자동 불러오기
    useEffect(() => {
        loadSettings().then((settings) => {
            if (settings.defaultArtistNote && !description) {
                setDescription(settings.defaultArtistNote);
            }
            if (settings.artistName) {
                setArtistName(settings.artistName);
            }
        });
    }, []);

    // 이미지 선택 핸들러
    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 이미지 파일만 허용
        if (!file.type.startsWith("image/")) {
            setError("이미지 파일만 선택할 수 있습니다.");
            return;
        }

        setImageFile(file);
        // 미리보기용 로컬 URL 생성 (실제 업로드는 저장 시)
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setError(null);
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!imagePreview) {
            setError("작품 이미지를 선택해주세요.");
            return;
        }

        if (!title.trim()) {
            setError("작품 제목을 입력해주세요.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Supabase Storage에 이미지 업로드
            let imageUrl = imagePreview;
            if (imageFile) {
                imageUrl = await uploadImageToStorage(imageFile);
            }

            await addArtwork({
                title: title.trim(),
                year,
                month,
                dimensions: dimensions.trim() || "크기 미정",
                medium: medium.trim() || "재료 미정",
                imageUrl: imageUrl,
                description: description.trim() || undefined,
                price: price.trim() || undefined,
                artistName: artistName,
            });

            // 미리보기 URL 정리
            if (imagePreview && imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }

            // 성공 시 해당 연도-월 탭으로 이동
            const yearMonthKey = month ? `${year}-${month}` : `${year}`;
            router.push(`/?yearMonth=${yearMonthKey}`);
        } catch (err) {
            console.error("Failed to add artwork:", err);
            setError("작품 저장에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    // 연도 옵션 생성 (현재 연도부터 50년 전까지)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 51 }, (_, i) => currentYear - i);

    // 월 옵션
    const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="min-h-screen bg-white">
            {/* 헤더 */}
            <header
                className="sticky top-0 z-30 bg-white border-b flex items-center justify-between"
                style={{
                    borderColor: "var(--border)",
                    padding: "var(--spacing-md)",
                }}
            >
                <button
                    onClick={() => router.push("/")}
                    className="touch-target flex items-center justify-center"
                    style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "12px",
                        background: "var(--secondary)",
                        border: "none",
                        cursor: "pointer",
                    }}
                    aria-label="뒤로 가기"
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                <h1
                    className="font-bold"
                    style={{ fontSize: "var(--font-size-xl)" }}
                >
                    작품 추가
                </h1>

                <div style={{ width: "56px" }} /> {/* 균형을 위한 빈 공간 */}
            </header>

            {/* 폼 */}
            <form
                onSubmit={handleSubmit}
                className="max-w-2xl mx-auto"
                style={{ padding: "var(--spacing-lg)" }}
            >
                {/* 에러 메시지 */}
                {error && (
                    <div
                        className="mb-6 p-4 rounded-xl text-center"
                        style={{
                            background: "#fef2f2",
                            color: "#dc2626",
                            fontSize: "var(--font-size-base)",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* 이미지 업로드 영역 */}
                <div className="mb-8">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
                        style={{
                            border: "3px dashed var(--border)",
                            background: imagePreview ? "transparent" : "var(--secondary)",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {imagePreview ? (
                            <>
                                <Image
                                    src={imagePreview}
                                    alt="작품 미리보기"
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                                <div
                                    className="absolute inset-0 flex items-center justify-center"
                                    style={{ background: "rgba(0,0,0,0.3)" }}
                                >
                                    <span
                                        className="text-white font-semibold px-6 py-3 rounded-xl"
                                        style={{
                                            background: "rgba(0,0,0,0.5)",
                                            fontSize: "var(--font-size-lg)",
                                        }}
                                    >
                                        📷 다시 선택
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <span style={{ fontSize: "64px", marginBottom: "16px" }}>📷</span>
                                <span
                                    className="font-semibold"
                                    style={{
                                        fontSize: "var(--font-size-xl)",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    작품 사진 선택
                                </span>
                                <span
                                    style={{
                                        fontSize: "var(--font-size-base)",
                                        color: "var(--text-muted)",
                                        marginTop: "8px",
                                    }}
                                >
                                    탭하여 사진첩에서 선택
                                </span>
                            </>
                        )}
                    </button>
                </div>

                {/* 작품 정보 입력 */}
                <div className="space-y-6">
                    {/* 제목 (필수) */}
                    <div>
                        <label
                            htmlFor="title"
                            className="block font-semibold mb-3"
                            style={{ fontSize: "var(--font-size-lg)" }}
                        >
                            작품 제목 <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: 봄날의 정원"
                            className="w-full rounded-xl"
                            style={{
                                padding: "16px 20px",
                                fontSize: "var(--font-size-lg)",
                                border: "2px solid var(--border)",
                                outline: "none",
                            }}
                        />
                    </div>

                    {/* 재료 */}
                    <div>
                        <label
                            htmlFor="medium"
                            className="block font-semibold mb-3"
                            style={{ fontSize: "var(--font-size-lg)" }}
                        >
                            재료
                        </label>
                        <input
                            id="medium"
                            type="text"
                            value={medium}
                            onChange={(e) => setMedium(e.target.value)}
                            placeholder="예: 캔버스에 유채"
                            className="w-full rounded-xl"
                            style={{
                                padding: "16px 20px",
                                fontSize: "var(--font-size-lg)",
                                border: "2px solid var(--border)",
                                outline: "none",
                            }}
                        />
                    </div>

                    {/* 크기 */}
                    <div>
                        <label
                            htmlFor="dimensions"
                            className="block font-semibold mb-3"
                            style={{ fontSize: "var(--font-size-lg)" }}
                        >
                            크기
                        </label>
                        <input
                            id="dimensions"
                            type="text"
                            value={dimensions}
                            onChange={(e) => setDimensions(e.target.value)}
                            placeholder="예: 100 × 80 cm"
                            className="w-full rounded-xl"
                            style={{
                                padding: "16px 20px",
                                fontSize: "var(--font-size-lg)",
                                border: "2px solid var(--border)",
                                outline: "none",
                            }}
                        />
                    </div>

                    {/* 제작 연도 */}
                    <div>
                        <label
                            htmlFor="year"
                            className="block font-semibold mb-3"
                            style={{ fontSize: "var(--font-size-lg)" }}
                        >
                            제작 연도
                        </label>
                        <select
                            id="year"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="w-full rounded-xl appearance-none"
                            style={{
                                padding: "16px 20px",
                                fontSize: "var(--font-size-lg)",
                                border: "2px solid var(--border)",
                                background: "white",
                                cursor: "pointer",
                            }}
                        >
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>{y}년</option>
                            ))}
                        </select>
                    </div>

                    {/* 제작 월 */}
                    <div>
                        <label
                            htmlFor="month"
                            className="block font-semibold mb-3"
                            style={{ fontSize: "var(--font-size-lg)" }}
                        >
                            제작 월 <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}>(선택)</span>
                        </label>
                        <select
                            id="month"
                            value={month || ""}
                            onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full rounded-xl appearance-none"
                            style={{
                                padding: "16px 20px",
                                fontSize: "var(--font-size-lg)",
                                border: "2px solid var(--border)",
                                background: "white",
                                cursor: "pointer",
                            }}
                        >
                            <option value="">월 선택 안함</option>
                            {monthOptions.map((m) => (
                                <option key={m} value={m}>{m}월</option>
                            ))}
                        </select>
                    </div>

                    {/* 설명 (선택) */}
                    <div>
                        <label
                            htmlFor="description"
                            className="block font-semibold mb-3"
                            style={{ fontSize: "var(--font-size-lg)" }}
                        >
                            작품 설명 <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}>(선택)</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="작품에 대한 설명이나 이야기를 적어주세요"
                            rows={4}
                            className="w-full rounded-xl resize-none"
                            style={{
                                padding: "16px 20px",
                                fontSize: "var(--font-size-lg)",
                                border: "2px solid var(--border)",
                                outline: "none",
                            }}
                        />
                    </div>

                    {/* 가격 (선택) */}
                    <div>
                        <label
                            htmlFor="price"
                            className="block font-semibold mb-3"
                            style={{ fontSize: "var(--font-size-lg)" }}
                        >
                            가격 <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}>(선택)</span>
                        </label>
                        <input
                            id="price"
                            type="text"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="예: 1,500,000원"
                            className="w-full rounded-xl"
                            style={{
                                padding: "16px 20px",
                                fontSize: "var(--font-size-lg)",
                                border: "2px solid var(--border)",
                                outline: "none",
                            }}
                        />
                    </div>
                </div>

                {/* 저장 버튼 */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-8 btn btn-primary"
                    style={{
                        minHeight: "64px",
                        fontSize: "var(--font-size-xl)",
                        opacity: isLoading ? 0.7 : 1,
                    }}
                >
                    {isLoading ? "저장 중..." : "✓ 작품 저장하기"}
                </button>
            </form>
        </div>
    );
}
