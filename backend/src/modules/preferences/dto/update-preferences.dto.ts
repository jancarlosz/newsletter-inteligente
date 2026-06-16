import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiProperty({
    example: ['cloud-computing', 'inteligencia-artificial'],
    description: 'Array de slugs das categorias preferidas',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  categories: string[];
}
