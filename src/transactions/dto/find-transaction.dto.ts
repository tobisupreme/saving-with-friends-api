import { IsEnum } from 'class-validator';
import { PaginationSearchOptionsDto } from '../../common/interfaces/pagination-search-options.interface';

export enum OrderByOptions {
  'createdAt',
  'amount',
}

export class FindTransactionsDto extends PaginationSearchOptionsDto {
  @IsEnum(OrderByOptions)
  orderBy?: OrderByOptions;
}
