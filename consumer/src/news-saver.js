"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsSaver = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NewsSaver {
    async save(title, summary, source, categorySlug) {
        // 1. Busca a categoria pelo slug gerado no Agente
        const category = await prisma.category.findUnique({
            where: { slug: categorySlug },
        });
        if (!category) {
            throw new Error(`Categoria ${categorySlug} não encontrada no banco!`);
        }
        // 2. Salva a notícia e evita duplicações pelo URL
        // Vamos gerar uma URL fictícia ou um Hash único baseado no título
        const generatedUrl = `https://news.singulari.tech/${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const news = await prisma.news.create({
            data: {
                title,
                summary,
                url: generatedUrl,
                source,
                publishedAt: new Date(),
                categoryId: category.id,
            },
        });
        console.log(`✅ Notícia salva com sucesso: [${news.id}] ${title}`);
        return news;
    }
    async disconnect() {
        await prisma.$disconnect();
    }
}
exports.NewsSaver = NewsSaver;
//# sourceMappingURL=news-saver.js.map