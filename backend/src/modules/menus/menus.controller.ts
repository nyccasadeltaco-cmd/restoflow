import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MenusService } from './menus.service';

@ApiTags('menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los menús' })
  findAll() {
    return this.menusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un menú por ID' })
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }
}
