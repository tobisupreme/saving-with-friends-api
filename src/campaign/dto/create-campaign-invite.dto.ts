import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class CreateCampaignInviteDto {
  @IsEmail({}, { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      const uniqueEmails = Array.from(new Set(value));
      return uniqueEmails.map((email) => email.toLowerCase());
    }
    return [value.toLowerCase()];
  })
  emails: string[];
}
