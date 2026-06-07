import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async uploadImage(file: Express.Multer.File, title: string, userId: string) {
    if (!file) throw new BadRequestException('No image file provided');
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    const storageKey = `gallery/${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    
    // Upload to Supabase Storage
    const imageUrl = await this.storageService.uploadFile(
      'gallery', 
      storageKey, 
      file.buffer, 
      file.mimetype
    );

    // Save metadata to database
    return this.prisma.galleryImage.create({
      data: {
        title,
        imageUrl,
        storageKey,
        uploadedById: userId,
      },
      include: { uploadedBy: { select: { name: true } } },
    });
  }

  async findAll(skip: number = 0, take: number = 20) {
    const [data, total] = await Promise.all([
      this.prisma.galleryImage.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { name: true } } },
      }),
      this.prisma.galleryImage.count(),
    ]);

    return { data, total, skip, take };
  }

  async deleteImage(id: string) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');

    // Delete from Supabase Storage
    await this.storageService.deleteFile('gallery', image.storageKey);

    // Delete from DB
    return this.prisma.galleryImage.delete({ where: { id } });
  }
}
