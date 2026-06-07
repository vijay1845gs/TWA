import { Controller, Post, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Backup & Restore')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('create')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a full database backup (ADMIN only)' })
  createBackup() {
    return this.backupService.createBackup();
  }

  @Get('list')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all available backups' })
  listBackups() {
    return this.backupService.listBackups();
  }

  @Get('download/:filename')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Download a backup file' })
  downloadBackup(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = this.backupService.getBackupFilePath(filename);
    if (!filepath) {
      return res.status(404).json({ message: 'Backup file not found' });
    }
    res.download(filepath, filename);
  }
}
