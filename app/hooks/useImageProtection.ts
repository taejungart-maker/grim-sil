"use client";

import { useEffect } from "react";

/**
 * Level 1 이미지 보호 훅
 * - 우클릭 방지
 * - 드래그 방지
 * - F12 개발자 도구 경고
 */
export function useImageProtection() {
    useEffect(() => {
        // 우클릭 방지
        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // 이미지나 이미지를 포함한 요소에서 우클릭 방지
            if (target.tagName === "IMG" || target.closest("img")) {
                e.preventDefault();
                return false;
            }
        };

        // 드래그 방지
        const handleDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "IMG") {
                e.preventDefault();
                return false;
            }
        };

        // F12 및 개발자 도구 단축키 차단
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12
            if (e.key === "F12") {
                e.preventDefault();
                console.warn("⚠️ 이미지 보호를 위해 개발자 도구가 제한됩니다.");
                return false;
            }

            // Ctrl+Shift+I (Chrome DevTools)
            if (e.ctrlKey && e.shiftKey && e.key === "I") {
                e.preventDefault();
                console.warn("⚠️ 이미지 보호를 위해 개발자 도구가 제한됩니다.");
                return false;
            }

            // Ctrl+Shift+J (Chrome Console)
            if (e.ctrlKey && e.shiftKey && e.key === "J") {
                e.preventDefault();
                console.warn("⚠️ 이미지 보호를 위해 개발자 도구가 제한됩니다.");
                return false;
            }

            // Ctrl+U (View Source)
            if (e.ctrlKey && e.key === "u") {
                e.preventDefault();
                console.warn("⚠️ 이미지 보호를 위해 소스 보기가 제한됩니다.");
                return false;
            }

            // Ctrl+S (Save)
            if (e.ctrlKey && e.key === "s") {
                const target = e.target as HTMLElement;
                if (target.tagName === "IMG" || target.closest("img")) {
                    e.preventDefault();
                    console.warn("⚠️ 이미지 저장이 제한됩니다.");
                    return false;
                }
            }
        };

        // 이벤트 리스너 등록
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("dragstart", handleDragStart);
        document.addEventListener("keydown", handleKeyDown);

        // 클린업
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("dragstart", handleDragStart);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
}

/**
 * 개발자 도구 감지 훅 (선택적)
 */
export function useDevToolsDetection() {
    useEffect(() => {
        let devtoolsOpen = false;

        // DevTools 열림 감지 (크기 변화 기반)
        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    console.warn("⚠️ 개발자 도구가 감지되었습니다. 이미지는 보호되고 있습니다.");
                }
            } else {
                devtoolsOpen = false;
            }
        };

        // 주기적으로 체크
        const interval = setInterval(detectDevTools, 1000);

        return () => clearInterval(interval);
    }, []);
}
