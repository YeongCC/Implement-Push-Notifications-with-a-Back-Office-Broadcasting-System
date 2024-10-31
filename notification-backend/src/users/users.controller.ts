import { Controller, Post, Body, Param, Request, UseGuards, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('create')
  async createUser(@Body() body: { email: string; password: string }) {
    return this.usersService.createUser(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('contacts')
  async getAllUsersExceptMe(@Request() req) {
    const userId = req.user.userId; 
    return this.usersService.getAllUsersExceptCurrent(userId);
  }

  @Get('getallusers')
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
