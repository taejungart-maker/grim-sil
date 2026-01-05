// 이미지에서 주요 색상 추출
// 중앙값 컷 알고리즘 사용

interface RGB {
    r: number;
    g: number;
    b: number;
}

function rgbToHex(rgb: RGB): string {
    const toHex = (n: number) => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function getColorDifference(c1: RGB, c2: RGB): number {
    return Math.sqrt(
        Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2)
    );
}

export async function extractDominantColors(
    imageData: string,
    count: number = 5
): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                // 성능을 위해 작은 크기로 샘플링
                const sampleSize = 100;
                canvas.width = sampleSize;
                canvas.height = sampleSize;

                ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
                const imageDataObj = ctx.getImageData(0, 0, sampleSize, sampleSize);
                const pixels = imageDataObj.data;

                // 픽셀 데이터에서 색상 추출 (4개씩: RGBA)
                const colors: RGB[] = [];
                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const a = pixels[i + 3];

                    // 너무 밝거나 어두운 색상, 투명한 픽셀 제외
                    if (a > 200 && r + g + b > 50 && r + g + b < 700) {
                        colors.push({ r, g, b });
                    }
                }

                if (colors.length === 0) {
                    // 기본 색상 반환
                    resolve(['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']);
                    return;
                }

                // 간단한 k-means 클러스터링
                const clusters: RGB[] = [];

                // 초기 클러스터 중심: 랜덤 선택
                const usedIndices = new Set<number>();
                while (clusters.length < Math.min(count, colors.length)) {
                    const idx = Math.floor(Math.random() * colors.length);
                    if (!usedIndices.has(idx)) {
                        clusters.push({ ...colors[idx] });
                        usedIndices.add(idx);
                    }
                }

                // k-means 반복 (최대 10회)
                for (let iter = 0; iter < 10; iter++) {
                    const clusterAssignments: number[] = [];
                    const clusterSums: RGB[] = clusters.map(() => ({ r: 0, g: 0, b: 0 }));
                    const clusterCounts: number[] = new Array(clusters.length).fill(0);

                    // 각 픽셀을 가장 가까운 클러스터에 할당
                    colors.forEach((color) => {
                        let minDist = Infinity;
                        let closestCluster = 0;

                        clusters.forEach((cluster, idx) => {
                            const dist = getColorDifference(color, cluster);
                            if (dist < minDist) {
                                minDist = dist;
                                closestCluster = idx;
                            }
                        });

                        clusterAssignments.push(closestCluster);
                        clusterSums[closestCluster].r += color.r;
                        clusterSums[closestCluster].g += color.g;
                        clusterSums[closestCluster].b += color.b;
                        clusterCounts[closestCluster]++;
                    });

                    // 클러스터 중심 업데이트
                    clusters.forEach((cluster, idx) => {
                        if (clusterCounts[idx] > 0) {
                            cluster.r = clusterSums[idx].r / clusterCounts[idx];
                            cluster.g = clusterSums[idx].g / clusterCounts[idx];
                            cluster.b = clusterSums[idx].b / clusterCounts[idx];
                        }
                    });
                }

                // 유사한 색상 제거 (최소 거리 30)
                const finalColors: RGB[] = [];
                const minDistance = 30;

                clusters.forEach((cluster) => {
                    let isSimilar = false;
                    for (const existingColor of finalColors) {
                        if (getColorDifference(cluster, existingColor) < minDistance) {
                            isSimilar = true;
                            break;
                        }
                    }
                    if (!isSimilar) {
                        finalColors.push(cluster);
                    }
                });

                // HEX로 변환
                const hexColors = finalColors.map(rgbToHex);

                // 최소 5개 보장
                while (hexColors.length < count) {
                    hexColors.push(`#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`);
                }

                resolve(hexColors.slice(0, count));
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
