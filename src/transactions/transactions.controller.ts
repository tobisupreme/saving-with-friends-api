import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthStrategy } from '../auth/decorators/auth-strategy.decorator';
import { AppGuard } from '../auth/guards/app.guard';
import { AuthStrategyType } from '../auth/interfaces';
import { ApiResponseMeta } from '../common/decorators/response.decorator';
import { RequestWithUser } from '../common/interfaces';
import { CreateTransactionDto } from './dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  private logger: Logger = new Logger(TransactionsController.name);
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiResponseMeta({
    passthrough: true,
  })
  @Get()
  async getTransactions() {
    this.logger.log('getting transactions');
    const transactions = await this.transactionsService.findMany<{
      id: number;
      amount: number;
      balance: number;
      createdAt: Date;
      type: string;
      user: { username: string };
      description?: string;
    }>({
      select: {
        id: true,
        amount: true,
        balance: true,
        createdAt: true,
        type: true,
        description: true,
        user: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      balance: transaction.balance,
      createdAt: transaction.createdAt,
      type: transaction.type,
      createdBy: transaction.user.username,
      additionalNotes: transaction.description,
    }));
  }

  @ApiResponseMeta({
    passthrough: true,
  })
  @Get('balance')
  async getBalance() {
    return this.transactionsService.getBalance();
  }

  @UseGuards(AppGuard)
  @ApiBearerAuth()
  @AuthStrategy([AuthStrategyType.BEARER])
  @Post()
  async createTransaction(
    @Body() dto: CreateTransactionDto,
    @Req() req: RequestWithUser,
  ) {
    try {
      return await this.transactionsService.createTransaction(dto, req);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id')
  async createTransactionAsAny(
    @Body() dto: CreateTransactionDto,
    @Param('id', new ParseIntPipe()) userId: number,
  ) {
    try {
      return await this.transactionsService.createTransaction(dto, {
        user: { userId },
      } as RequestWithUser);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
