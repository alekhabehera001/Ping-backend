import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { updateProfileSchema } from './validation/users.validation';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get own profile' })
  async getMe(@Request() req: any) {
    const data = await this.usersService.getMe(req.user._id.toString());
    return { message: 'Profile fetched', data };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update own profile' })
  async updateMe(
    @Request() req: any,
    @Body(new JoiValidationPipe(updateProfileSchema)) body: any,
  ) {
    const data = await this.usersService.updateMe(req.user._id.toString(), body);
    return { message: 'Profile updated', data };
  }

  @Get('partner')
  @ApiOperation({ summary: 'Get partner profile' })
  async getPartner(@Request() req: any) {
    const data = await this.usersService.getPartner(req.user._id.toString());
    return { message: 'Partner profile fetched', data };
  }
}
