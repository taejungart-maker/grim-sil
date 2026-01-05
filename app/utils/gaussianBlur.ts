// 가우스 블러 처리 유틸리티
// Canvas API를 사용하여 이미지에 블러 효과 적용

export async function applyGaussianBlur(
    imageData: string,
    blurRadius: number = 30
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            try {
                // Canvas 생성
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                // 이미지 크기 설정 (성능을 위해 최대 크기 제한)
                const maxSize = 1200;
                let width = img.width;
                let height = img.height;

                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;

                // 블러 필터 적용
                ctx.filter = `blur(${blurRadius}px)`;
                ctx.drawImage(img, 0, 0, width, height);

                // Blob으로 변환 (JPEG 압축)
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create blob'));
                        }
                    },
                    'image/jpeg',
                    0.8 // 80% 품질
                );
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = imageData;
    });
}

// 블러 이미지를 Data URL로 변환
export async function blurImageToDataURL(
    imageData: string,
    blurRadius: number = 30
): Promise<string> {
    const blob = await applyGaussianBlur(imageData, blurRadius);
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
