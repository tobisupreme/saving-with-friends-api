import { BadRequestException, Injectable, LoggerService } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import moment from 'moment';
import { AppUtilities } from '../app.utilities';
import { CrudService } from '../common/database/crud.service';
import { PrismaService } from '../common/database/prisma/prisma.service';
import { RequestWithUser } from '../common/interfaces';
import { AppLoggerService } from '../logger/logger.service';
import { CampaignMaptype } from './campaign.maptype';
import {
  CreateCampaignDto,
  CreateCampaignInviteDto,
  JoinCampaignDto,
} from './dto';
import { FilterCampaignDto } from './dto/filter-campaign.dto';

@Injectable()
export class CampaignService extends CrudService<
  Prisma.CampaignDelegate,
  CampaignMaptype
> {
  private readonly logger: LoggerService;

  constructor(
    private readonly prismaClient: PrismaService,
    loggerService: AppLoggerService,
  ) {
    super(prismaClient.campaign);
    this.logger = loggerService.createLogger(CampaignService.name);
  }

  async findCampaigns(dto: FilterCampaignDto, authClient?: RequestWithUser) {
    const parsedQueryFilters = this.parseQueryFilter(dto, [
      'name',
      'code',
      {
        key: 'startDate',
        where: (value) => ({
          startDate: { gte: value },
        }),
      },
      {
        key: 'endDate',
        where: (value) => ({
          endDate: { lte: value },
        }),
      },
    ]);

    const findArgs: Prisma.CampaignFindManyArgs = {
      where: {
        ...parsedQueryFilters,
        ...(authClient?.user?.userId && {
          campaignUsers: {
            some: { userId: authClient?.user?.userId },
          },
        }),
      },
      select: { ...this.getCampaignSelect() },
    };

    return this.findManyPaginate(findArgs, dto);
  }

  async createCampaign(dto: CreateCampaignDto, authClient: RequestWithUser) {
    const uniqueCode = `${AppUtilities.generateShortCode(4)}-${AppUtilities.generateShortCode(4)}`;

    const executeDbTransaction = async (prismaClient: PrismaService) => {
      const createCampaignArgs: Prisma.CampaignCreateArgs = {
        data: {
          name: dto.name,
          code: uniqueCode,
          shortDescription: dto.shortDescription,
          longDescription: dto.longDescription,
          campaignType: dto.campaignType,
          startDate: dto.startDate,
          endDate: dto.endDate,
          createdBy: {
            connect: { id: authClient.user.userId },
          },
        },
        select: { ...this.getCampaignSelect() },
      };

      const campaign = await prismaClient.campaign.create(createCampaignArgs);
      const createCampaignUserArgs: Prisma.CampaignUserCreateArgs = {
        data: {
          campaign: { connect: { id: campaign.id } },
          user: { connect: { id: authClient.user.userId } },
          type: 'admin',
        },
      };

      await prismaClient.campaignUser.create(createCampaignUserArgs);
      return campaign;
    };

    return this.prismaClient.$transaction(async (tPrisma: PrismaService) => {
      return await executeDbTransaction(tPrisma);
    });
  }

  async createCampaignInvite(
    campaignId: number,
    dto: CreateCampaignInviteDto,
    authClient: RequestWithUser,
  ) {
    await this.prismaClient.campaign.findFirstOrThrow({
      where: { id: campaignId, creatorId: authClient.user.userId },
    });

    const oneWeekFromToday = moment().add(7, 'days').toDate();

    const existingInvites = await this.prismaClient.campaignInvitation.findMany(
      {
        where: {
          campaignId,
          email: { in: dto.emails },
          expiresAt: { gt: new Date() },
          status: 'pending',
        },
        select: {
          email: true,
          expiresAt: true,
          token: true,
        },
      },
    );

    const existingInviteEmails = new Set(
      existingInvites.map((invite) => invite.email),
    );
    const emailsToInvite = dto.emails.filter(
      (email) => !existingInviteEmails.has(email),
    );

    if (emailsToInvite.length === 0) {
      return {
        message: 'All provided emails already have valid invites',
        existingInvites,
        newInvites: [],
      };
    }

    const createInvitePromises = emailsToInvite.map((email) => {
      const uniqueCode = `${AppUtilities.generateShortCode(4)}-${AppUtilities.generateShortCode(4)}-${AppUtilities.generateShortCode(4)}`;

      return this.prismaClient.campaignInvitation.create({
        data: {
          expiresAt: oneWeekFromToday,
          token: uniqueCode,
          campaign: { connect: { id: campaignId } },
          email,
          status: 'pending',
        },
        select: {
          email: true,
          expiresAt: true,
          token: true,
        },
      });
    });

    const results = await Promise.allSettled(createInvitePromises);

    const { successfulInvites, failedInvites } = results.reduce(
      (acc, result, index) => {
        if (result.status === 'fulfilled') {
          acc.successfulInvites.push(result.value);
        } else {
          acc.failedInvites.push({
            email: emailsToInvite[index],
            status: 'failed',
            error: result.reason?.message || 'Unknown error',
          });
        }
        return acc;
      },
      {
        successfulInvites: [] as Array<{
          email: string;
          expiresAt: Date;
          token: string;
        }>,
        failedInvites: [] as Array<{
          email: string;
          status: 'failed';
          error: string;
        }>,
      },
    );

    if (failedInvites.length > 0) {
      this.logger.error(
        `Failed to create ${failedInvites.length} campaign invites`,
        null,
        'CampaignService',
        {
          campaignId,
          failedInvites,
        },
      );
    }

    return {
      message: 'Campaign invites processed',
      existingInvites,
      newInvites: successfulInvites,
      failedInvites: failedInvites.length > 0 ? failedInvites : undefined,
    };
  }

  async getCampaignUsers(campaignId: number, authClient: RequestWithUser) {
    return this.prismaClient.campaignUser.findMany({
      where: {
        campaignId,
        status: true,
        campaign: { creatorId: authClient.user.userId },
      },
    });
  }

  async joinCampaign(
    dto: JoinCampaignDto,
    authClient: RequestWithUser,
  ) {
    return this.prismaClient.$transaction(async (prisma) => {
      try {
        const campaignInvite = await prisma.campaignInvitation.findFirst({
          where: {
            token: dto.token,
            email: authClient.user.email,
          },
          select: {
            id: true,
            status: true,
            expiresAt: true,
            campaignId: true,
            campaign: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        });

        if (!campaignInvite) {
          this.logger.warn(
            'Join campaign attempt failed: No invitation found',
            {
              token: dto.token,
              userEmail: authClient.user.email,
              userId: authClient.user.userId,
            },
          );
          throw new BadRequestException('Invalid invitation');
        }

        if (campaignInvite.status !== 'pending') {
          this.logger.warn(
            'Join campaign attempt failed: Invalid invitation status',
            {
              inviteId: campaignInvite.id,
              status: campaignInvite.status,
              userId: authClient.user.userId,
            },
          );
          throw new BadRequestException('Invalid invitation');
        }

        if (campaignInvite.expiresAt <= new Date()) {
          await prisma.campaignInvitation.update({
            where: { id: campaignInvite.id },
            data: { status: 'expired' },
          });
          
          this.logger.warn(
            'Join campaign attempt failed: Expired invitation',
            {
              inviteId: campaignInvite.id,
              expiryDate: campaignInvite.expiresAt,
              userId: authClient.user.userId,
            },
          );
          throw new BadRequestException('Invalid invitation');
        }

        const existingMembership = await prisma.campaignUser.findFirst({
          where: {
            campaignId: campaignInvite.campaignId,
            userId: authClient.user.userId,
            status: true,
          },
        });

        if (existingMembership) {
          this.logger.warn(
            'Join campaign attempt failed: User already a member',
            {
              userId: authClient.user.userId,
              campaignId: campaignInvite.campaignId,
              inviteId: campaignInvite.id,
            },
          );
          throw new BadRequestException('Unable to join campaign');
        }

        const campaignUser = await prisma.campaignUser.create({
          data: {
            campaign: { connect: { id: campaignInvite.campaignId } },
            user: { connect: { id: authClient.user.userId } },
            type: 'member',
          },
          select: {
            id: true,
            type: true,
            campaign: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        });

        await prisma.campaignInvitation.update({
          where: { id: campaignInvite.id },
          data: { status: 'accepted' },
        });

        this.logger.log(
          'User joined campaign successfully',
          {
            userId: authClient.user.userId,
            campaignId: campaignInvite.campaignId,
            inviteId: campaignInvite.id,
          },
        );

        return {
          message: 'Successfully joined campaign',
          membership: {
            id: campaignUser.id,
            type: campaignUser.type,
            campaignId: campaignUser.campaign.id,
          },
        };
      } catch (error) {
        if (!(error instanceof BadRequestException)) {
          this.logger.error(
            'Unexpected error during campaign join',
            {
              error: error.message,
              stack: error.stack,
              userId: authClient.user.userId,
              token: dto.token,
            },
          );
          throw new BadRequestException('Unable to join campaign');
        }
        throw error;
      }
    });
  }

  private getCampaignSelect() {
    const select: Prisma.CampaignSelect = {
      id: true,
      name: true,
      code: true,
      shortDescription: true,
      longDescription: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      creatorId: true,
    };

    return select;
  }
}
