import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { GetNewsDto } from './dto/get-news.dto';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista notícias com paginação e filtros' })
  findAll(@Query() query: GetNewsDto) {
    return this.newsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma notícia específica por ID' })
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }
}
