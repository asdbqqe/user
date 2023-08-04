import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from './sign.up.entity';
import { AuthDto } from './dto/auth.dto';
import { EmailService } from '../utils/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private emailService: EmailService,
  ) {}

  async registerUser(authDto: AuthDto): Promise<User> {
    const { email, password } = authDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new UnauthorizedException('Email is already registered.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      email,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    const confirmationToken = jwt.sign(
      { sub: savedUser._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' },
    );
    const confirmationLink = `${confirmationToken}`;
    await this.emailService.sendConfirmationEmail(email, confirmationLink);

    return savedUser;
  }

  async confirmEmail(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      const userId = decoded.sub;

      await this.userModel.findByIdAndUpdate(userId, { isConfirmed: true });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async loginUser(authDto: AuthDto): Promise<{ accessToken: string }> {
    const { email, password } = authDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateAccessToken(user);
    return { accessToken };
  }

  async getUserById(userId: string): Promise<User> {
    return this.userModel.findById(userId).exec();
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload = { sub: user._id, email: user.email };
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });
  }
}
