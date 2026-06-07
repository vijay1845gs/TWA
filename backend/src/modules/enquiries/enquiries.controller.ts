import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Enquiries')
@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Public()
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // max 5 per minute
  @ApiOperation({ summary: 'Submit a new enquiry from the landing page' })
  create(
    @Body('name') name: string,
    @Body('mobile') mobile: string,
    @Body('description') description: string,
  ) {
    return this.enquiriesService.create(name, mobile, description);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'List all enquiries' })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.enquiriesService.findAll(skip ? Number(skip) : 0, take ? Number(take) : 20);
  }
}
