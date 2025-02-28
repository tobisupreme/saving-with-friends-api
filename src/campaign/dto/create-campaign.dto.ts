import { Transform } from 'class-transformer';
import {
  IsDateString,
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
  @Transform(({ value }) => new Date(value).toISOString())
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value && new Date(value).toISOString())
  endDate?: Date;
}
