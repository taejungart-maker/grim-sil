"use client";

import VipManagement from "../VipManagement";

interface AdminVipSectionProps {
    bgColor: string;
    textColor: string;
    borderColor: string;
    mutedColor: string;
}

export default function AdminVipSection({
    bgColor,
    textColor,
    borderColor,
    mutedColor
}: AdminVipSectionProps) {
    return (
        <section className="pt-8">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">💎 VIP 및 사용자 관리</h2>
            <VipManagement
                bgColor={bgColor}
                textColor={textColor}
                borderColor={borderColor}
                mutedColor={mutedColor}
            />
        </section>
    );
}
