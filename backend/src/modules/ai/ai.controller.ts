import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('dish-description')
  async generateDishDescription(
    @Body('dishName') dishName: string,
    @Body('language') language: string = 'es',
  ) {
    const description = await this.aiService.generateDishDescription(dishName, language);
    return { description };
  }
}
