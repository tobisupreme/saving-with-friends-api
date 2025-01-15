import { AppUtilities } from '@@/app.utilities';
import { CrudService } from '@@common/database/crud.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { SignUpDto } from './dto';
import { UserMaptype } from './user.maptype';

@Injectable()
export class CoreUserService extends CrudService<
  Prisma.UserDelegate,
  UserMaptype
> {
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient.user);
  }

  async findOne(identity: string, prismaClient?: PrismaClient) {
    prismaClient = prismaClient ?? this.prismaClient;

    return prismaClient.user.findFirst({
      where: { OR: [{ email: identity }, { username: identity }] },
      include: { contact: true },
    });
  }

  async identityExists(identity: string, prismaClient?: PrismaClient) {
    prismaClient = prismaClient ?? this.prismaClient;

    return !!(await prismaClient.user.findFirst({
      where: { OR: [{ username: identity }, { email: identity }] },
    }));
  }

  async setupUser(dto: SignUpDto) {
    const identityExists = await this.identityExists(dto.email);
    if (identityExists)
      throw new BadRequestException({
        code: 'EMAIL_EXISTS',
        message: 'Signup failed. Email unavailable',
      });

    const hashedPassword = await AppUtilities.hashAuthSecret(dto.password);

    const user = await this.prismaClient.$transaction(
      async (prisma: PrismaClient) => {
        const [firstName, ...last] = dto.name.split(' ');
        const { id } = await prisma.userContact.create({
          data: { firstName, lastName: last?.join(' ') || undefined },
        });
        return await prisma.user.create({
          select: {
            id: true,
            email: true,
            username: true,
            contact: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
          data: {
            email: dto.email,
            password: hashedPassword,
            contact: { connect: { id } },
          },
        });
      },
    );

    return this.transformUserPayload(user);
  }

  transformUserPayload(user: any) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.contact.firstName,
      lastName: user.contact.lastName,
      phone: user.contact.phone,
    };
  }
}
