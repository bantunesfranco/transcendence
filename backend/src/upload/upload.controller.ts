import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from 'src/auth/guards';
import RequestWithUser from 'src/auth/request-with-user.interface';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { UserAuth } from 'src/utilities/user.decorator';

@Controller('upload')
export class UploadController {
  private uploadsPath = `https://${this.configService.getOrThrow('HOST')}:3000/uploads/`;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './src/public/uploads/',
        filename: (req, file, callback) => {
          // console.log('request user:', req.user); // ? debug
          const userId = (req as RequestWithUser).user.id;
          const fileName = `user_${userId}_avatar${extname(file.originalname)}`;
          callback(null, fileName);
        },
      }),
    }),
  )
  async patchAvatar(
    @UserAuth() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // console.log('Upload file:', file); // ? debug
    // console.log('me:', user); // ? debug
    const avatar = this.uploadsPath + file.filename;
    return await this.userService.update(user.id, { avatar });
  }
}
