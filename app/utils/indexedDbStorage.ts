// IndexedDB를 사용한 영감 로컬 저장소
const DB_NAME = 'GrimsilInspirations';
const STORE_NAME = 'inspirations';
const DB_VERSION = 1;

export interface InspirationData {
    id: string;
    originalFileName: string;
    blurImageUrl: string;
    colorPalette: string[];
    metadata: {
        timestamp: number;
        location?: string;
        weather?: string;
    };
    localPath?: string;
    createdAt: number;
}

// IndexedDB 초기화
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('createdAt', 'createdAt', { unique: false });
            }
        };
    });
}

// 영감 데이터 저장
export async function saveToIndexedDB(data: InspirationData): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(data);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ID로 영감 데이터 가져오기
export async function getFromIndexedDB(id: string): Promise<InspirationData | null> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

// 모든 영감 데이터 가져오기 (최신순)
export async function getAllInspirations(): Promise<InspirationData[]> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const results = request.result as InspirationData[];
            // 최신순 정렬
            results.sort((a, b) => b.createdAt - a.createdAt);
            resolve(results);
        };
        request.onerror = () => reject(request.error);
    });
}

// 영감 데이터 삭제
export async function deleteFromIndexedDB(id: string): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// 모든 영감 데이터 삭제
export async function clearAllInspirations(): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
