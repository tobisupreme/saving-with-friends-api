import { Gender } from '@@common/interfaces';
import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Length(5, 20)
  @Transform(({ value }) => value.trim())
  username?: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserContactDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsOptional()
  @Transform(({ value }) => value.trim())
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  @IsOptional()
  lastName?: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  @IsOptional()
  phone?: string;
}

export class SignUpUserDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  @IsDefined()
  userInfo: CreateUserDto;

  @ValidateNested()
  @Type(() => UserContactDto)
  @IsDefined()
  userContactInfo: UserContactDto;
}
