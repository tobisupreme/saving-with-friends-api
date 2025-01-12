import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum TransactionType {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
}

export class CreateTransactionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  createdAt?: Date;
}
