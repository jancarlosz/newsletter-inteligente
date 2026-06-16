export declare class NewsSaver {
    save(title: string, summary: string, source: string, categorySlug: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        summary: string;
        url: string;
        source: string;
        publishedAt: Date;
        keywords: string[];
        categoryId: string;
    }>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=news-saver.d.ts.map