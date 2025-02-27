import { CrudMapType } from '@@common/interfaces/crud-map-type.interface';
import { Prisma } from '@prisma/client';

export class CampaignMaptype implements CrudMapType {
  aggregate: Prisma.CampaignAggregateArgs;
  createMany?: Prisma.CampaignCreateManyArgs;
  count: Prisma.CampaignCountArgs;
  create: Prisma.CampaignCreateArgs;
  delete: Prisma.CampaignDeleteArgs;
  deleteMany: Prisma.CampaignDeleteManyArgs;
  findFirst: Prisma.CampaignFindFirstArgs;
  findMany: Prisma.CampaignFindManyArgs;
  findUnique: Prisma.CampaignFindUniqueArgs;
  update: Prisma.CampaignUpdateArgs;
  updateMany: Prisma.CampaignUpdateManyArgs;
  upsert: Prisma.CampaignUpsertArgs;
}
