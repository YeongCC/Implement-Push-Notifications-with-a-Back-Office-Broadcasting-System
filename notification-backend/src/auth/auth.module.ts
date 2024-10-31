import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule,
    MessagesModule, 
  ],
  providers: [AuthService, JwtStrategy, AdminGuard], 
  controllers: [AuthController, AdminController],
  exports: [AuthService, AdminGuard],
})
export class AuthModule {}
