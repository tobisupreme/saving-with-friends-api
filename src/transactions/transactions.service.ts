import { CrudService } from '@@common/database/crud.service';
import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { TransactionMaptype } from './transactions.maptype';
import { CreateTransactionDto, TransactionType } from './dto';
import { RequestWithUser } from '../common/interfaces';

@Injectable()
export class TransactionsService extends CrudService<
  Prisma.TransactionDelegate,
  TransactionMaptype
> {
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient.transaction);
  }

  async createTransaction(
    data: CreateTransactionDto,
    authClient: RequestWithUser,
  ) {
    return await this.prismaClient.$transaction(
      async (prisma: PrismaClient) => {
        const { amount: balance } = await prisma.balance.findUnique({
          where: { id: 1 },
          select: { amount: true },
        });

        let balanceAfterTransaction = 0;

        switch (data.type) {
          case TransactionType.Deposit:
            balanceAfterTransaction = balance.toNumber() + data.amount;
            break;
          case TransactionType.Withdraw:
            balanceAfterTransaction = balance.toNumber() - data.amount;
            break;
          default:
            throw new Error('Invalid transaction type');
        }

        if (balanceAfterTransaction < 0) {
          throw new Error('Insufficient balance');
        }

        await prisma.balance.update({
          where: { id: 1 },
          data: { amount: balanceAfterTransaction },
        });

        return await prisma.transaction.create({
          data: {
            amount: data.amount,
            type: data.type,
            balance: balanceAfterTransaction,
            description: data.description,
            user: { connect: { id: authClient.user.userId } },
            ...(data.createdAt && { createdAt: data.createdAt }),
          },
        });
      },
    );
  }

  async getBalance() {
    const { amount: balance } = await this.prismaClient.balance.findUnique({
      where: { id: 1 },
      select: { amount: true },
    });

    return { balance };
  }
}
