import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CloseoutReportDto, CloseoutReportQueryDto } from './dto/closeout-report.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.RESTAURANT_ADMIN, UserRole.STAFF)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('closeout')
  @ApiOperation({
    summary: 'Closeout report by paid range',
    description:
      'Returns closeout metrics for orders that were paid in the given range (from <= paidAt < to).',
  })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  @ApiQuery({ name: 'from', required: true, type: String })
  @ApiQuery({ name: 'to', required: true, type: String })
  @ApiResponse({ status: 200, type: CloseoutReportDto })
  async getCloseout(
    @Query() query: CloseoutReportQueryDto,
    @Request() req,
  ): Promise<CloseoutReportDto> {
    return this.reportsService.getCloseoutReport(query, req.user);
  }
}
