import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDefined, IsOptional } from 'class-validator';
import { PaginationSearchOptionsDto } from '../../common/interfaces/pagination-search-options.interface';

export class FilterCampaignDto extends PaginationSearchOptionsDto {
  @IsDefined()
  @IsOptional()
  @Transform(({ value }) => (value && Array.isArray(value) ? value : [value]))
  campaignType?: string[];

  @ApiProperty({
    format: 'yyyy-MM-dd',
  })
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({
    format: 'yyyy-MM-dd',
  })
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}
