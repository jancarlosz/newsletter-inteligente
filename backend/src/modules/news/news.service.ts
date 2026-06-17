import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetNewsDto, PeriodFilter } from './dto/get-news.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async findAll(dto: GetNewsDto) {
    const { page = 1, limit = 10, period, category, categories } = dto;
    
    // Calcula paginação
    const skip = (page - 1) * limit;

    // Constrói filtro condicional "where"
    const where: any = {};

    // Filtro por categoria única (ex: ?category=cloud-computing)
    if (category) {
      where.category = { slug: category };
    }

    // Filtro por múltiplas categorias — feed personalizado (ex: ?categories=ia,cloud,seguranca)
    if (categories && !category) {
      const slugList = categories.split(',').map(s => s.trim()).filter(Boolean);
      if (slugList.length > 0) {
        where.category = { slug: { in: slugList } };
      }
    }

    if (period) {
      const dateLimit = new Date();
      if (period === PeriodFilter.DAY) {
        dateLimit.setDate(dateLimit.getDate() - 1);
      } else if (period === PeriodFilter.WEEK) {
        dateLimit.setDate(dateLimit.getDate() - 7);
      } else if (period === PeriodFilter.MONTH) {
        dateLimit.setMonth(dateLimit.getMonth() - 1);
      }
      where.publishedAt = { gte: dateLimit };
    }

    // Executa contagem total e busca das notícias em paralelo
    const [total, items] = await Promise.all([
      this.prisma.news.count({ where }),
      this.prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
    });

    if (!news) {
      throw new NotFoundException(`Notícia com ID ${id} não encontrada`);
    }

    return news;
  }
}
