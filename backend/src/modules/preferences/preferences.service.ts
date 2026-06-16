import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class PreferencesService {
  constructor(private prisma: PrismaService) {}

  async getUserPreferences(userId: string) {
    const preferences = await this.prisma.userPreference.findMany({
      where: { userId },
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
    });
    return preferences.map((p) => p.category);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    // 1. Validar se todos os slugs existem
    const categories = await this.prisma.category.findMany({
      where: { slug: { in: dto.categories } },
    });

    if (categories.length !== dto.categories.length) {
      throw new BadRequestException('Uma ou mais categorias informadas não existem');
    }

    // 2. Transação para remover as antigas e inserir as novas
    await this.prisma.$transaction(async (prisma) => {
      // Remove todas as preferências atuais
      await prisma.userPreference.deleteMany({
        where: { userId },
      });

      // Se houver novas, insere
      if (categories.length > 0) {
        await prisma.userPreference.createMany({
          data: categories.map((cat) => ({
            userId,
            categoryId: cat.id,
          })),
        });
      }
    });

    return this.getUserPreferences(userId);
  }
}
