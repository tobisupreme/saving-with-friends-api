import {
  Body,
  Controller,
  Get,
  LoggerService,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthStrategy } from '../auth/decorators/auth-strategy.decorator';
import { AppGuard } from '../auth/guards/app.guard';
import { AuthStrategyType } from '../auth/interfaces';
import { RequestWithUser } from '../common/interfaces';
import { AppLoggerService } from '../logger/logger.service';
import { CampaignService } from './campaign.service';
import {
  CreateCampaignDto,
  CreateCampaignInviteDto,
  JoinCampaignDto,
} from './dto';
import { FilterCampaignDto } from './dto/filter-campaign.dto';
import { CreateCampaignGuard } from './guards/create-campaign.guard';

@UseGuards(AppGuard)
@AuthStrategy(AuthStrategyType.BEARER)
@ApiBearerAuth()
@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignController {
  private readonly logger: LoggerService;
  constructor(
    private readonly campaignService: CampaignService,
    logger: AppLoggerService,
  ) {
    this.logger = logger.createLogger(CampaignController.name);
  }

  @Get()
  async getCampaigns(@Query() dto: FilterCampaignDto) {
    return this.campaignService.findCampaigns(dto);
  }

  @Get('my-campaigns')
  async myCampaigns(
    @Query() dto: FilterCampaignDto,
    @Req() authClient: RequestWithUser,
  ) {
    return this.campaignService.findCampaigns(dto, authClient);
  }

  @UseGuards(CreateCampaignGuard)
  @Post()
  async createCampaign(
    @Body() dto: CreateCampaignDto,
    @Req() authClient: RequestWithUser,
  ) {
    return this.campaignService.createCampaign(dto, authClient);
  }

  @UseGuards(CreateCampaignGuard)
  @Post(':campaignId/invite')
  async createCampaignInvite(
    @Param('campaignId', new ParseIntPipe()) campaignId: number,
    @Body() dto: CreateCampaignInviteDto,
    @Req() authClient: RequestWithUser,
  ) {
    return this.campaignService.createCampaignInvite(
      campaignId,
      dto,
      authClient,
    );
  }

  @Post('/join')
  async joinCampaign(
    @Query() dto: JoinCampaignDto,
    @Req() authClient: RequestWithUser,
  ) {
    return this.campaignService.joinCampaign(dto, authClient);
  }

  @Get(':campaignId/users')
  async getCampaignUsers(
    @Req() authClient: RequestWithUser,
    @Param('campaignId', new ParseIntPipe()) campaignId: number,
  ) {
    return this.campaignService.getCampaignUsers(campaignId, authClient);
  }
}
