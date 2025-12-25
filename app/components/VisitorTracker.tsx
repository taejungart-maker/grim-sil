"use client";

import { useEffect } from "react";
import { incrementVisitorCount } from "../utils/db";

export default function VisitorTracker() {
    useEffect(() => {
        // 동일 세션(브라우저 탭 유지) 내에서는 한 번만 카운트
        const hasTracked = sessionStorage.getItem("has_tracked_visit");

        if (!hasTracked) {
            incrementVisitorCount();
            sessionStorage.setItem("has_tracked_visit", "true");
        }
    }, []);

    return null; // 화면에는 아무것도 렌더링하지 않음
}
