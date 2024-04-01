import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { Profile } from 'passport';
import { Statistic } from 'src/statistic/statistic.entity';
import { StatisticService } from 'src/statistic/statistic.service';
import { UpdateStatDto } from 'src/statistic/dto/update-stat.dto';
import { Observable, from, switchMap } from 'rxjs';
import { IUserJwt } from './interfaces/user-jwt.interface';
import { CreateStatDto } from 'src/statistic/dto/create-stat.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly statService: StatisticService,
  ) {}

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    return this.userRepository.update(userId, {
      twoFactorAuthSecret: secret,
    });
  }

  async enableTwoFactorAuth(userId: number) {
    return this.userRepository.update(userId, {
      isTwoFactorAuthEnabled: true,
    });
  }

  async disableTwoFactorAuth(userId: number) {
    return this.update(userId, {
      isTwoFactorAuthEnabled: false,
      twoFactorAuthSecret: '',
    });
  }

  /**
   * 1/ Creates a new user entry
   * 2/ Creates and saves a new stat entry to DB (ID is only generated upon saving)
   * 3/ Links new stat entry with new user statistics, same for ids
   * 4/ Saves new user entry to DB
   * 		If failure, removes the created stat entry
   * 5/	Updates previous stat entry with new user id
   */
  async create(dto: CreateUserDto): Promise<User> {
    try {
      const user = new User();
      user.intraName = dto.intraName;
      user.avatar = dto.avatar;
      user.refreshToken = dto.refreshToken;

      const newStats = await this.statService.create(user.intraName);
      if (!newStats) {
        throw new Error(
          `Error creating new statistic entry for: [${user.intraName}]`,
        );
      }

      user.statistics = newStats;
      user.statId = newStats.id;

      await this.userRepository.save(user).catch(async (error) => {
        await this.statService.remove(newStats.id);
        throw new Error(
          `Saving new user entry for: [${user.intraName}]\n` + error,
        );
      });

      console.log(
        `Saved new user id: ${user.id} | intraName: ${user.intraName}`,
      );

      const updateStatDto: UpdateStatDto = {
        id: user.statId,
        userId: user.id,
      };

      const updateResult = await this.statService.update(updateStatDto);
      if (updateResult.affected === 0) {
        throw new Error(`Error updating stat entry for: [${updateStatDto.id}]`);
      }
      console.log(`Updated stats id: [${updateStatDto.id}]`);

      return user;
    } catch (error) {
      // console.error(error); // ? debug
      throw new Error(`Error creating new user entry for: ${dto.intraName}`);
    }
  }

  async findAll(): Promise<User[] | null> {
    return this.userRepository.find();
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id: id });
  }

  async getMe(userId: number) {
    console.log('getMe userId:', userId); // ? debug
    return this.userRepository.findOne({
      relations: {
        statistics: true,
      },
      where: {
        id: userId,
      },
    });
  }

  /**
   * Gets current user (auth guard) and its meta data (stats for now)
   */
  async findOneWithMeta(userId: number) {
    console.log('findOneWithMeta userId:', userId); // ? debug
    return this.userRepository.findOne({
      relations: {
        statistics: true,
      },
      where: {
        id: userId,
      },
    });
  }

  getProfile(user: IUserJwt) {
    return from(this.userRepository.findOneByOrFail({ id: user.id }));
  }

  async findOrCreate(profile: Profile) {
    try {
      let found_user = await this.findByIntraName(profile.username);
      if (!found_user) {
        console.log(`This user [${profile.username}] is not registered.`);
        console.log(`Creating user entry: [${profile.username}]`);

        const user: CreateUserDto = {
          intraName: profile.username,
          avatar: profile.photos[0].value,
          refreshToken: null,
        };

        found_user = await this.create(user);
      } else {
        console.log(`Logging in user: [${found_user.intraName}]`);
      }
      return found_user;
    } catch (error) {
      console.log('Auth error!');
      return null;
    }
  }

  async findByIntraName(name: string): Promise<User | null> {
    return this.userRepository.findOneBy({ intraName: name });
  }

  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    try {
      // console.log('Updating userId:', userId); // ? debug
      // console.log('updateUserDto:', updateUserDto); // ? debug
      const result = await this.userRepository.update(userId, updateUserDto);
      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    console.log(`Deleting user id: [${id}]`);
    return this.userRepository.delete(id);
  }

  async addFriend(userId: number, friendId: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    console.log(
      'Adding friend to userId: ' + userId + ' | friendId: ' + friendId,
    ); // ? debug

    if (user.id !== friendId && !user.friendList.includes(friendId)) {
      user.friendList.push(friendId);
      if (user.blockList.includes(friendId)) {
        console.log(
          'Removing blocked user for userId: ' +
            user.id +
            ' | blockedUserId: ' +
            friendId,
        ); // ? debug
        user.blockList = user.blockList.filter((id) => id !== friendId);
      }
      return await this.userRepository.save(user);
    }
    // console.log(user.friendList); // ? debug
  }

  async blockUser(userId: number, blockedUserId: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    console.log(
      'Blocking user for userId: ' +
        userId +
        ' | blockedUserId: ' +
        blockedUserId,
    ); // ? debug

    if (user.id !== blockedUserId && !user.blockList.includes(blockedUserId)) {
      user.blockList.push(blockedUserId);
      if (user.friendList.includes(blockedUserId)) {
        console.log(
          'Removing friend for userId: ' +
            user.id +
            ' | friendId: ' +
            blockedUserId,
        ); // ? debug
        user.friendList = user.friendList.filter((id) => id !== blockedUserId);
      }
      return await this.userRepository.save(user);
    }
  }

  async findAllWithMeta() {
    const users = await this.userRepository.find({
      relations: {
        games: true,
        statistics: true,
        messages: true,
        chats: true,
      },
    });
    return users;
  }

  async validateUserName(userId: number, newUserName: string) {
    console.log('Validating new user name:', newUserName);

    const existingUser = await this.userRepository.findOne({
      where: { userName: newUserName },
    });

    if (existingUser && existingUser.id !== userId) {
      return {
        valid: false,
        message: 'Username already exists.',
      };
    }

    const usernameRegex = /^[a-zA-Z0-9]+$/;

    if (!usernameRegex.test(newUserName)) {
      return {
        valid: false,
        message: 'Username must contain only letters and numbers.',
      };
    }

    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.userName = newUserName;
    console.log(
      'Saving new user name: ' + user.userName + ' | userId: ' + user.id,
    ); // ? debug
    await this.userRepository.save(user);
    return { valid: true, message: 'Valid username!' };
  }

  // getFriends(userId: number): Observable<User[]> {
  //   console.log('getFriends'); // ? debug
  //   return from(this.userRepository.findBy({ id: userId })).pipe(
  //     switchMap((user) => {
  //       console.log(user);

  //       return from([]);
  //       // const friendIds = user.friendList || []; // Get the list of friend IDs from the user

  //       // if (friendIds.length === 0) {
  //       //   return from([]); // No friends, return an empty array
  //       // }

  //       // return this.userRepository.findByIds(friendIds); // Find users by their IDs
  //     }),
  //   );
  // }
}
