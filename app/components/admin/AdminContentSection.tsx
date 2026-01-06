"use client";

import { SiteConfig } from "../../config/site";
import { uploadImageToStorage } from "../../utils/db";
import { SIGNATURE_COLORS } from "../../utils/themeColors";

interface AdminContentSectionProps {
    settings: SiteConfig;
    setSettings: (s: SiteConfig) => void;
    effectiveArtistId: string;
    borderColor: string;
}

export default function AdminContentSection({
    settings,
    setSettings,
    effectiveArtistId,
    borderColor
}: AdminContentSectionProps) {
    return (
        <div className="space-y-8 md:space-y-12 pt-8">
            {/* 작가 소개 */}
            <section className="pt-6 md:pt-8 border-t" style={{ borderColor }}>
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">👤 작가 소개 설정</h2>
                <div className="space-y-6">
                    <div className="flex gap-4 md:gap-6 items-start">
                        <div className="w-24 h-32 md:w-32 md:h-40 bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 border-2" style={{ borderColor }}>
                            {settings.aboutmeImage ? <img src={settings.aboutmeImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No Image</div>}
                        </div>
                        <div className="flex-1">
                            <input type="file" id="p-upload" hidden onChange={async e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const url = await uploadImageToStorage(file, effectiveArtistId);
                                    setSettings({ ...settings, aboutmeImage: url });
                                }
                            }} />
                            <label htmlFor="p-upload" className="inline-block px-3 py-1.5 md:px-4 md:py-2 border-2 rounded-lg font-bold cursor-pointer hover:bg-gray-50 transition text-sm md:text-base" style={{ borderColor }}>이미지 변경</label>
                            <p className="mt-2 text-[10px] md:text-xs opacity-50">작가 프로필 사진을 업로드해 주세요.</p>
                        </div>
                    </div>
                    {/* 평론 */}
                    <div className="p-5 rounded-2xl border-2 space-y-4" style={{ borderColor }}>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold opacity-70">평론 (CRITIQUE)</label>
                            <button
                                onClick={() => setSettings({ ...settings, showCritique: !settings.showCritique })}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${settings.showCritique ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}
                            >
                                {settings.showCritique ? "공개 중" : "비공개"}
                            </button>
                        </div>
                        <textarea
                            className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent font-serif text-sm md:text-base"
                            style={{ borderColor }}
                            rows={6}
                            value={settings.aboutmeCritique}
                            onChange={e => setSettings({ ...settings, aboutmeCritique: e.target.value })}
                            placeholder="작가 평론을 입력하세요."
                        />
                    </div>

                    {/* 작가 노트 */}
                    <div className="p-5 rounded-2xl border-2 space-y-4" style={{ borderColor }}>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold opacity-70">작가 노트 (ARTIST NOTE)</label>
                            <button
                                onClick={() => setSettings({ ...settings, showArtistNote: !settings.showArtistNote })}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${settings.showArtistNote ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}
                            >
                                {settings.showArtistNote ? "공개 중" : "비공개"}
                            </button>
                        </div>
                        <textarea
                            className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent font-serif text-sm md:text-base"
                            style={{ borderColor }}
                            rows={6}
                            value={settings.aboutmeNote}
                            onChange={e => setSettings({ ...settings, aboutmeNote: e.target.value })}
                            placeholder="작가 노트를 입력하세요."
                        />
                    </div>

                    {/* 프로필 */}
                    <div className="p-5 rounded-2xl border-2 space-y-4" style={{ borderColor }}>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold opacity-70">프로필 (PROFILE)</label>
                            <button
                                onClick={() => setSettings({ ...settings, showHistory: !settings.showHistory })}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${settings.showHistory ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}
                            >
                                {settings.showHistory ? "공개 중" : "비공개"}
                            </button>
                        </div>
                        <textarea
                            className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent font-serif text-sm md:text-base"
                            style={{ borderColor }}
                            rows={6}
                            value={settings.aboutmeHistory}
                            onChange={e => setSettings({ ...settings, aboutmeHistory: e.target.value })}
                            placeholder="작가 프로필 (학력, 경력, 수상 이력 등)을 입력하세요."
                        />
                    </div>
                </div>
            </section>

            {/* 실시간 뉴스 */}
            <section className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2" style={{ borderColor: SIGNATURE_COLORS.royalIndigo }}>
                <h3 className="text-lg font-bold text-indigo-700 mb-2">실시간 뉴스 문구</h3>
                <textarea className="w-full p-4 border-2 rounded-xl bg-transparent" style={{ borderColor }} value={settings.newsText} onChange={e => setSettings({ ...settings, newsText: e.target.value })} placeholder="상단바에 흐르는 뉴스 문구를 입력하세요" />
            </section>
        </div>
    );
}
