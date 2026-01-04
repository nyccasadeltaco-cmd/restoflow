import { IsString, IsBoolean, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DayScheduleDto {
  @ApiProperty({ required: false, example: '09:00', description: 'Hora de apertura en formato HH:mm' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'El formato de hora debe ser HH:mm (ej: 09:00)',
  })
  open?: string;

  @ApiProperty({ required: false, example: '22:00', description: 'Hora de cierre en formato HH:mm' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'El formato de hora debe ser HH:mm (ej: 22:00)',
  })
  close?: string;

  @ApiProperty({ required: false, example: false, description: 'Indica si el restaurante está cerrado este día' })
  @IsOptional()
  @IsBoolean()
  closed?: boolean;
}

export class OperatingHoursDto {
  @ApiProperty({ required: false, type: DayScheduleDto })
  @IsOptional()
  monday?: DayScheduleDto;

  @ApiProperty({ required: false, type: DayScheduleDto })
  @IsOptional()
  tuesday?: DayScheduleDto;

  @ApiProperty({ required: false, type: DayScheduleDto })
  @IsOptional()
  wednesday?: DayScheduleDto;

  @ApiProperty({ required: false, type: DayScheduleDto })
  @IsOptional()
  thursday?: DayScheduleDto;

  @ApiProperty({ required: false, type: DayScheduleDto })
  @IsOptional()
  friday?: DayScheduleDto;

  @ApiProperty({ required: false, type: DayScheduleDto })
  @IsOptional()
  saturday?: DayScheduleDto;

  @ApiProperty({ required: false, type: DayScheduleDto })
  @IsOptional()
  sunday?: DayScheduleDto;
}
