import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';


@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(private readonly prisma: PrismaService) {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(this.backupDir, filename);

    // Export all key tables
    const [bills, customers, vehicles, payments] = await Promise.all([
      this.prisma.bill.findMany({ include: { items: true } }),
      this.prisma.customer.findMany(),
      this.prisma.vehicle.findMany(),
      this.prisma.payment.findMany(),
    ]);

    const backupData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      bills,
      customers,
      vehicles,
      payments,
    };

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf8');
    this.logger.log(`Backup created: ${filename}`);

    return {
      filename,
      filepath,
      exportedAt: backupData.exportedAt,
      counts: {
        bills: bills.length,
        customers: customers.length,
        vehicles: vehicles.length,
        payments: payments.length,
      },
    };
  }

  listBackups() {
    if (!fs.existsSync(this.backupDir)) return [];
    const files = fs.readdirSync(this.backupDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const stat = fs.statSync(path.join(this.backupDir, f));
        return { filename: f, size: stat.size, createdAt: stat.birthtime };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return files;
  }

  getBackupFilePath(filename: string): string | null {
    // Sanitize filename to prevent path traversal
    const safe = path.basename(filename);
    const filepath = path.join(this.backupDir, safe);
    if (!fs.existsSync(filepath)) return null;
    return filepath;
  }
}
