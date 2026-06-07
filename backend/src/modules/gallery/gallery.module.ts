import { Module } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [GalleryService],
  controllers: [GalleryController],
  exports: [GalleryService]
})
export class GalleryModule {}
