import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NewsSaver {
  async save(
    title: string,
    summary: string,
    content: string,
    source: string,
    categorySlug: string
  ) {
    // 1. Busca a categoria pelo slug gerado no Agente
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new Error(`Categoria ${categorySlug} não encontrada no banco!`);
    }

    // 2. Salva a notícia e evita duplicações pelo URL
    // Vamos gerar uma URL fictícia ou um Hash único baseado no título
    const generatedUrl = `https://www.google.com/search?q=${encodeURIComponent(title)}`;

    const saved = await prisma.news.create({
      data: {
        title,
        summary,
        content,
        url: generatedUrl,
        source,
        publishedAt: new Date(),
        categoryId: category.id,
      },
    });

    console.log(`✅ Notícia salva com sucesso: [${saved.id}] ${title}`);
    return saved;
  }

  async disconnect() {
    await prisma.$disconnect();
  }
}
