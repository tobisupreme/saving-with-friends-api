import { CrudMapType } from '@@common/interfaces/crud-map-type.interface';
import { Prisma } from '@prisma/client';

export class TransactionMaptype implements CrudMapType {
  aggregate: Prisma.TransactionAggregateArgs;
  createMany?: Prisma.TransactionCreateManyArgs;
  count: Prisma.TransactionCountArgs;
  create: Prisma.TransactionCreateArgs;
  delete: Prisma.TransactionDeleteArgs;
  deleteMany: Prisma.TransactionDeleteManyArgs;
  findFirst: Prisma.TransactionFindFirstArgs;
  findMany: Prisma.TransactionFindManyArgs;
  findUnique: Prisma.TransactionFindUniqueArgs;
  update: Prisma.TransactionUpdateArgs;
  updateMany: Prisma.TransactionUpdateManyArgs;
  upsert: Prisma.TransactionUpsertArgs;
}
