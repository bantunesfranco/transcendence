import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { UserAuth } from 'src/utilities/user.decorator';
import { IUserJwt } from './interfaces/user-jwt.interface';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /***************************************
   * GET
   ***************************************/

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMeta(@UserAuth() user: IUserJwt) {
    return this.userService.findOneWithMeta(user.id);
  }

  @Get()
  async findAll(): Promise<User[]> {
    // return this.userService.findAll();
    return this.userService.findAllWithMeta();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.userService.findById(+id);
  }

  @Get('meta/:id')
  async findOneWithMeta(@Param('id') id: number): Promise<User | null> {
    return this.userService.findOneWithMeta(id);
  }

  /**
   * ! not being used anymore
   */
  @UseGuards(JwtAuthGuard)
  @Get('friends/me')
  getFriends(@UserAuth() user: IUserJwt) {
    // return this.userService.getFriends(user.id);
  }

  /***************************************
   * POST
   ***************************************/

  @Post(':userId/add-friend')
  async addFriend(
    @Param('userId')
    userId: number,
    @Body() body: { friendId: number },
  ): Promise<User> {
    return await this.userService.addFriend(userId, body.friendId);
  }

  @Post(':userId/block-user')
  async blockUser(
    @Param('userId')
    userId: number,
    @Body() body: { blockedUserId: number },
  ): Promise<User> {
    return await this.userService.blockUser(userId, body.blockedUserId);
  }

  /***************************************
   * PATCH
   ***************************************/

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMyProfile(
    @UserAuth() user: IUserJwt,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // console.log('userId:', user.id); // ? debug
    return this.userService.update(user.id, updateUserDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    // console.log('id:', id); // ? debug
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/validate-username')
  async validateUserName(
    @UserAuth() user: IUserJwt,
    @Body() body: { userName: string },
  ) {
    // console.log('userId:', user.id); // ? debug
    return await this.userService.validateUserName(user.id, body.userName);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/update-status')
  updateStatus(
    @UserAuth() user: IUserJwt,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user.id, updateUserDto);
  }

  /***************************************
   * DELETE
   ***************************************/

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
