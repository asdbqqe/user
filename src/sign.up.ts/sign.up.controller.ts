import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './sign.up.service';
import { AuthDto } from './dto/auth.dto';
import * as jwt from 'jsonwebtoken';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

class AuthResponse {
  message: string;
  accessToken: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: AuthDto })
  @ApiResponse({ type: AuthResponse })
  async register(@Body() authDto: AuthDto, @Res() res) {
    try {
      const user = await this.authService.registerUser(authDto);
      const accessToken = await this.authService.generateAccessToken(user);
      res
        .status(HttpStatus.CREATED)
        .json({ message: 'User registered successfully', accessToken });
    } catch (err) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Registration failed' });
    }
  }

  @Get('/confirm/:token')
  async confirmEmail(@Param('token') token: string, @Res() res) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      const user = await this.authService.getUserById(decoded.sub.toString());
      if (user && !user.isConfirmed) {
        user.isConfirmed = true;
        await user.save();
        res
          .status(HttpStatus.OK)
          .json({ message: 'Email confirmed successfully' });
      } else {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Invalid token or email already confirmed' });
      }
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid token' });
    }
  }

  @Post('/login')
  async login(@Body() authDto: AuthDto, @Res() res) {
    try {
      const accessToken = await this.authService.loginUser(authDto);
      res.status(HttpStatus.OK).json({ accessToken });
    } catch (err) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Invalid credentials' });
    }
  }
}
