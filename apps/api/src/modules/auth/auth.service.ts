import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userService.findByPhone(dto.phone);
    if (existingUser) {
      throw new ConflictException('User with this phone already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.userService.create({
      phone: dto.phone,
      password: hashedPassword,
      username: dto.username,
    });

    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        username: user.username,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByPhone(dto.phone);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        username: user.username,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async telegramLogin(telegramData: Record<string, unknown>) {
    if (!this.validateTelegramAuth(telegramData)) {
      throw new UnauthorizedException('Invalid Telegram auth data');
    }

    const telegramId = String(telegramData.id);
    let user = await this.userService.findByTelegramId(telegramId);

    if (!user) {
      user = await this.userService.create({
        telegramId,
        username: telegramData.username as string,
      });
    }

    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
      },
      ...tokens,
    };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private validateTelegramAuth(data: Record<string, unknown>): boolean {
    const botToken = this.configService.get<string>('telegram.botToken');
    if (!botToken) return false;

    const { hash, ...authData } = data;
    if (!hash || typeof hash !== 'string') return false;

    const checkString = Object.keys(authData)
      .sort()
      .map((key) => `${key}=${authData[key]}`)
      .join('\n');

    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

    return hmac === hash;
  }
}
