import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Analytics & Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get top-level overview stats' })
  getDashboard() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('range')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get audit report for a date range' })
  getRangeReport(@Query('from') from: string, @Query('to') to: string) {
    const fromDate = from ? new Date(from) : new Date(0);
    const toDate = to ? new Date(to) : new Date();
    return this.analyticsService.getRangeReport(fromDate, toDate);
  }

  @Get('four-month')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get data for 4-month performance charts' })
  getFourMonthPerformance() {
    return this.analyticsService.getFourMonthPerformance();
  }
}

