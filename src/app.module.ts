import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './sign.up.ts/sign.up.entity';
import { AuthService } from './sign.up.ts/sign.up.service';
import { AuthController } from './sign.up.ts/sign.up.controller';
import { EmailService } from './utils/email.service';
import { EmailTemplatesService } from './utils/email.templates';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, EmailTemplatesService],
})
export class AppModule {}
