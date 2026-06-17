import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

export class NewsSaver {
  /**
   * Gera uma URL única baseada no hash do título.
   * Garante unicidade determinística sem depender de URLs externas.
   */
  private generateUniqueUrl(title: string): string {
    const hash = createHash('sha256').update(title).digest('hex').substring(0, 12);
    return `internal://news/${hash}`;
  }

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

    // 2. Gera URL única baseada no hash do título
    const uniqueUrl = this.generateUniqueUrl(title);

    // 3. Upsert: cria se não existe, atualiza se já existe (idempotência)
    const saved = await prisma.news.upsert({
      where: { url: uniqueUrl },
      update: {
        summary,
        content,
      },
      create: {
        title,
        summary,
        content,
        url: uniqueUrl,
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
