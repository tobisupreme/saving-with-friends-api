import { User, UserContact } from '@prisma/client';
import { Request } from 'express';

export abstract class SeedRunner {
  abstract run(): Promise<any>;
}

export enum AuthStrategyType {
  JWT = 'jwt',
  PUBLIC = 'public',
}

interface ICacheKeysEnums {
  TOKENS: string;
  DOMAINS: string;
  PERMISSIONS: string;
  REQUESTS: string;
}

export const CacheKeysEnums = (appName: string): ICacheKeysEnums => ({
  DOMAINS: `${appName}:Domains`,
  PERMISSIONS: `${appName}:Permissions`,
  REQUESTS: `${appName}:Requests`,
  TOKENS: `${appName}:Tokens`,
});

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  UNKNOWN = 'Unknown',
}

export enum ResponseMessage {
  SUCCESS = 'Request Successful!',
  FAILED = 'Request Failed!',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface JwtSessionPayload {
  userId: number;
  sessionId: string;
  email: string;
  username?: string;
  user: User & { contact: UserContact };
}

export interface JwtSignPayload {
  id: number;
}

export interface RequestWithUser extends Request {
  user: JwtSessionPayload;
  permittedFields?: any;
  selectFields?: any;
}
