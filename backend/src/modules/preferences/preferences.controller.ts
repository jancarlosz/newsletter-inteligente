import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PreferencesService } from './preferences.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Preferences')
@ApiBearerAuth() // Indica ao Swagger que precisa de token JWT
@UseGuards(JwtAuthGuard) // Protege todas as rotas deste controller
@Controller('users/me/preferences') // A rota é focada no usuário autenticado
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Busca as categorias preferidas do usuário autenticado' })
  getUserPreferences(@Request() req: any) {
    // req.user é injetado pelo JwtStrategy
    return this.preferencesService.getUserPreferences(req.user.userId);
  }

  @Put()
  @ApiOperation({ summary: 'Atualiza as categorias preferidas do usuário autenticado' })
  updatePreferences(@Request() req: any, @Body() dto: UpdatePreferencesDto) {
    return this.preferencesService.updatePreferences(req.user.userId, dto);
  }
}
