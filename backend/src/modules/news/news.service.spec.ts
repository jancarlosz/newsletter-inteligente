import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { PeriodFilter } from './dto/get-news.dto';

describe('NewsService', () => {
  let service: NewsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    news: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar lista de notícias com paginação padrão', async () => {
      const mockNews = [{ id: '1', title: 'Test News' }];
      mockPrismaService.news.count.mockResolvedValue(1);
      mockPrismaService.news.findMany.mockResolvedValue(mockNews);

      const result = await service.findAll({});

      expect(mockPrismaService.news.count).toHaveBeenCalledWith({ where: {} });
      expect(mockPrismaService.news.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { publishedAt: 'desc' },
        include: { category: { select: { name: true, slug: true } } },
      });
      expect(result).toEqual({
        data: mockNews,
        meta: { total: 1, page: 1, lastPage: 1 },
      });
    });

    it('deve aplicar filtros de categoria e período corretamente', async () => {
      mockPrismaService.news.count.mockResolvedValue(0);
      mockPrismaService.news.findMany.mockResolvedValue([]);

      await service.findAll({
        page: 2,
        limit: 5,
        category: 'inteligencia-artificial',
        period: PeriodFilter.WEEK,
      });

      expect(mockPrismaService.news.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
          where: expect.objectContaining({
            category: { slug: 'inteligencia-artificial' },
            publishedAt: expect.any(Object), // gte date
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('deve lançar NotFoundException se a notícia não existir', async () => {
      mockPrismaService.news.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid_id')).rejects.toThrow(NotFoundException);
    });

    it('deve retornar a notícia se for encontrada', async () => {
      const mockNews = { id: 'valid_id', title: 'Found News' };
      mockPrismaService.news.findUnique.mockResolvedValue(mockNews);

      const result = await service.findOne('valid_id');

      expect(mockPrismaService.news.findUnique).toHaveBeenCalledWith({
        where: { id: 'valid_id' },
        include: { category: { select: { name: true, slug: true } } },
      });
      expect(result).toEqual(mockNews);
    });
  });
});
