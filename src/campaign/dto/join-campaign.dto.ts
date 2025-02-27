import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class JoinCampaignDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  token: string;
} 
