import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase credentials not configured. Storage will fail.');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Upload a file buffer to a specified bucket
   */
  async uploadFile(bucket: string, path: string, fileBuffer: Buffer, contentType: string): Promise<string> {
    if (!this.supabase) throw new InternalServerErrorException('Storage not configured');

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Upload failed: ${error.message}`);
      throw new InternalServerErrorException(`Failed to upload file to storage: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  }

  /**
   * Delete a file from a specified bucket
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    if (!this.supabase) throw new InternalServerErrorException('Storage not configured');

    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      this.logger.error(`Delete failed: ${error.message}`);
      throw new InternalServerErrorException(`Failed to delete file from storage: ${error.message}`);
    }
  }
}
