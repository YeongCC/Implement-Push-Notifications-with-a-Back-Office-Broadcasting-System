import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(email: string, password: string ): Promise<User> {

    const newUser = new this.userModel({ email, password, role: "user"});
    return newUser.save();
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateUserNotifications(id: string, notificationsEnabled: boolean): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, { notificationsEnabled }, { new: true });
  }

  async getAllUsersExceptCurrent(userId: string) {
    return this.userModel.find({ _id: { $ne: userId } }).select('_id email').exec();
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find({}, '_id email').exec(); 
  }
}
