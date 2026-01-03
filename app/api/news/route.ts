import { NextResponse } from 'next/server';

export const revalidate = 60; // 1분마다 캐시 갱신

const SOURCES = [
    {
        name: "ART NEWS - 전시",
        rss: "https://news.google.com/rss/search?q=%EB%AF%B8%EC%88%A0+%EC%A0%84%EC%8B%9C&hl=ko&gl=KR&ceid=KR:ko",
        category: "전시정보",
    },
    {
        name: "ART NEWS - 공모전",
        rss: "https://news.google.com/rss/search?q=%EB%AF%B8%EC%88%A0+%EA%B3%B5%EB%AA%A8%EC%A0%84&hl=ko&gl=KR&ceid=KR:ko",
        category: "공모/지원",
    }
];

export async function GET() {
    let allNews: any[] = [];

    try {
        for (const src of SOURCES) {
            try {
                const response = await fetch(src.rss);

                if (!response.ok) continue;

                const xmlContent = await response.text();

                // 간이 XML 파싱 (Server-side에는 DOMParser가 없으므로 정규식이나 간단한 문자열 처리 사용)
                const items = xmlContent.split('<item>').slice(1);

                const parsedItems = items.map((item) => {
                    const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "제목 없음";
                    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "#";
                    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || new Date().toISOString();

                    const cleanTitle = title.split(" - ")[0];
                    const sourceFromTitle = title.split(" - ")[1] || src.name;

                    return {
                        title: cleanTitle,
                        link: link,
                        pubDate: pubDate,
                        source: sourceFromTitle,
                        category: src.category,
                        description: ""
                    };
                });

                allNews.push(...parsedItems);
            } catch (e) {
                console.error(`Failed to fetch from ${src.name}:`, e);
            }
        }

        const uniqueNews = Array.from(new Map(allNews.map(item => [item.title, item])).values());
        uniqueNews.sort((a: any, b: any) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

        return NextResponse.json(uniqueNews);
    } catch (error) {
        console.error("News API Error:", error);
        return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
    }
}
