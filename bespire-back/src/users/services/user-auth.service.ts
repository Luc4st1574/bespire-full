import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserAuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailService: MailService,
  ) {}

  async createPasswordHash(password: string): Promise<string> {
    if (!password || password.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long.',
      );
    }
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    const token = randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    await this.mailService.sendResetPasswordEmail(email, resetUrl);

    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.userModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!user) throw new BadRequestException('Invalid or expired token');

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    return true;
  }
}
