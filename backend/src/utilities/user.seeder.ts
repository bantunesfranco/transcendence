import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import axios from 'axios';

@Injectable()
export class UserSeeder {
  constructor(private userService: UserService) {}

  async seedUsers() {
    const url = `https://randomapi.com/api/?key=5CGS-E5F2-X2JB-C7VW&ref=dwoifz7z&results=10&seed=woof`;
    try {
      const response = await axios.get(url);
      const users = response.data.results;
      for (const user of users) {
        // console.log(user); // ? debug
        const userDto: CreateUserDto = {
          intraName: user.intraName,
          avatar: user.avatar,
          refreshToken: user.refreshToken,
        };
        await this.userService.create(userDto);
      }
    } catch (error) {
      console.error(`Error while creating user ${error}`);
    }
  }
}
