import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 50)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 100)
  @Transform(({ value }) => value.trim())
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  longDescription: string;

  @IsString()
  @IsNotEmpty()
  campaignType: string;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;
}
