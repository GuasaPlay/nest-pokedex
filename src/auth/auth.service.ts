import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = await this.userModel.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      return {
        ...user.toJSON(),
        token: this.getJwtToken({ _id: user._id }),
      };
    } catch (error) {
      this.handleException(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userModel.findOne({ email });

    if (!user)
      throw new BadRequestException(`User with email ${email} not found`);

    if (!bcrypt.compareSync(password, user.password))
      throw new BadRequestException(`Invalid credentials`);

    return {
      ...user.toJSON(),
      token: this.getJwtToken({ _id: user._id }),
    };
  }

  async checkAuthStatus(user: User) {
    return {
      _id: user._id,
      email: user.email,
      // roles: user.roles,
      fullName: user.fullName,
      token: this.getJwtToken({ _id: user._id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleException(error: any): never {
    console.log(error);
    if (error.code === 11000) {
      throw new BadRequestException(
        `User with email ${error.keyValue.email} already exists`,
      );
    }

    throw new InternalServerErrorException(`An error occured - Check logs`);
  }
}
