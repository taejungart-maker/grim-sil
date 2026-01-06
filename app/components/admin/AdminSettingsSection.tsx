"use client";

import { SiteConfig } from "../../config/site";

interface AdminSettingsSectionProps {
    settings: SiteConfig;
    setSettings: (s: SiteConfig) => void;
    borderColor: string;
}

export default function AdminSettingsSection({
    settings,
    setSettings,
    borderColor
}: AdminSettingsSectionProps) {
    return (
        <div className="space-y-8 md:space-y-12">
            {/* 기본 정보 */}
            <section>
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">🏠 기본 정보</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs md:text-sm font-semibold mb-2 opacity-70">Gallery 한글 이름 (상단 바)</label>
                        <input className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent text-sm md:text-base" style={{ borderColor }} value={settings.galleryNameKo} onChange={e => setSettings({ ...settings, galleryNameKo: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-semibold mb-2 opacity-70">작가 이름</label>
                        <input className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent text-sm md:text-base" style={{ borderColor }} value={settings.artistName} onChange={e => setSettings({ ...settings, artistName: e.target.value })} />
                    </div>
                </div>
            </section>

            {/* SEO 설정 */}
            <section>
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">🌐 사이트 설정 (SEO)</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs md:text-sm font-semibold mb-2 opacity-70">사이트 제목 (브라우저 탭)</label>
                        <input className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent text-sm md:text-base" style={{ borderColor }} value={settings.siteTitle} onChange={e => setSettings({ ...settings, siteTitle: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-semibold mb-2 opacity-70">사이트 설명</label>
                        <textarea className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent text-sm md:text-base" style={{ borderColor }} rows={3} value={settings.siteDescription} onChange={e => setSettings({ ...settings, siteDescription: e.target.value })} />
                    </div>
                    <div className="pt-2">
                        <button
                            onClick={() => {
                                const siteUrl = typeof window !== 'undefined' ? window.location.origin : "";
                                const kakaoToolUrl = `https://developers.kakao.com/tool/clear/og?url=${encodeURIComponent(siteUrl)}`;
                                window.open(kakaoToolUrl, '_blank');
                            }}
                            className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                        >
                            <span>✨ 카카오톡 미리보기 강제 갱신 (캐시 삭제)</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </button>
                        <p className="mt-2 text-[11px] opacity-50">프로필 사진이나 제목 변경 후 카카오톡에 예전 정보가 뜰 때 사용하세요.</p>
                    </div>
                </div>
            </section>

            {/* 테마 및 레이아웃 */}
            <section>
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">🎨 테마 및 레이아웃</h2>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <button onClick={() => setSettings({ ...settings, theme: "white" })} className={`p-2 md:p-2.5 rounded-xl border-2 font-bold text-sm md:text-base ${settings.theme === "white" ? "border-black bg-white text-black" : "border-gray-200 opacity-50 text-gray-400"}`}>화이트 테마</button>
                    <button onClick={() => setSettings({ ...settings, theme: "black" })} className={`p-2 md:p-2.5 rounded-xl border-2 font-bold text-sm md:text-base ${settings.theme === "black" ? "border-white bg-black text-white" : "border-gray-800 opacity-50 text-gray-400"}`}>블랙 테마</button>
                </div>
                <div className="mt-4 md:mt-6 flex gap-2">
                    {[1, 3, 4].map(cols => (
                        <button key={cols} onClick={() => setSettings({ ...settings, gridColumns: cols as any })} className={`flex-1 p-2 rounded-xl border-2 font-bold text-xs md:text-base ${settings.gridColumns === cols ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-transparent bg-gray-50 text-gray-400"}`}>{cols}열 배열</button>
                    ))}
                </div>
            </section>
        </div>
    );
}
