import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tenants' })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tenant por ID' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tenant' })
  create(@Body() createData: any) {
    return this.tenantsService.create(createData);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tenant' })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.tenantsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tenant' })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
