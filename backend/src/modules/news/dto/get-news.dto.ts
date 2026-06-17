import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum PeriodFilter {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class GetNewsDto {
  @ApiPropertyOptional({ description: 'Página (inicia em 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filtrar por período (hoje, semana, mês)',
    enum: PeriodFilter,
  })
  @IsOptional()
  @IsEnum(PeriodFilter)
  period?: PeriodFilter;

  @ApiPropertyOptional({
    description: 'Filtrar por slug da categoria (ex: inteligencia-artificial)',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por múltiplas categorias (slugs separados por vírgula). Usado para feed personalizado.',
    example: 'inteligencia-artificial,cloud-computing,ciberseguranca',
  })
  @IsOptional()
  @IsString()
  categories?: string;
}
