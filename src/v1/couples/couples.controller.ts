import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { CouplesService } from './couples.service';
import { anniversarySchema, joinCoupleSchema } from './validation/couples.validation';

@ApiTags('Couples')
@Controller('v1/couples')
@UseGuards(JwtAuthGuard)
export class CouplesController {
  constructor(private readonly couplesService: CouplesService) {}

  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate couple invite code' })
  async generateInvite(@Request() req: any) {
    const data = await this.couplesService.generateInvite(req.user._id.toString());
    return { message: 'Invite code generated', data };
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join couple with invite code' })
  async joinCouple(
    @Request() req: any,
    @Body(new JoiValidationPipe(joinCoupleSchema)) body: any,
  ) {
    const data = await this.couplesService.joinCouple(req.user._id.toString(), body.inviteCode);
    return { message: 'Successfully joined couple', data };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get couple info' })
  async getCouple(@Request() req: any) {
    const data = await this.couplesService.getCouple(req.user._id.toString());
    return { message: 'Couple info fetched', data };
  }

  @Patch('anniversary')
  @ApiOperation({ summary: 'Set relationship anniversary' })
  async setAnniversary(
    @Request() req: any,
    @Body(new JoiValidationPipe(anniversarySchema)) body: any,
  ) {
    const data = await this.couplesService.setAnniversary(req.user._id.toString(), body.anniversary);
    return { message: 'Anniversary updated', data };
  }

  @Delete('unlink')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink partner' })
  async unlinkPartner(@Request() req: any) {
    await this.couplesService.unlinkPartner(req.user._id.toString());
    return { message: 'Partner unlinked' };
  }
}
