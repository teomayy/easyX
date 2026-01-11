import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@easyx/database';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface CreateUserData {
  phone?: string;
  password?: string;
  username?: string;
  telegramId?: string;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData) {
    return this.prisma.user.create({
      data: {
        phone: data.phone,
        password: data.password,
        username: data.username,
        telegramId: data.telegramId,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findByTelegramId(telegramId: string) {
    return this.prisma.user.findUnique({
      where: { telegramId },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        username: true,
        telegramId: true,
        kycStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
      },
      select: {
        id: true,
        phone: true,
        username: true,
        telegramId: true,
        kycStatus: true,
        createdAt: true,
      },
    });
  }
}
