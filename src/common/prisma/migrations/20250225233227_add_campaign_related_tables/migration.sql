-- AlterTable
ALTER TABLE "campaign_users" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'member';

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "name" VARCHAR(50) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "balance" SET DEFAULT 0,
ALTER COLUMN "shortDescription" SET DATA TYPE VARCHAR(100);

-- CreateTable
CREATE TABLE "campaign_invitations" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_invitations_token_key" ON "campaign_invitations"("token");

-- CreateIndex
CREATE INDEX "campaign_invitations_token_idx" ON "campaign_invitations"("token");

-- CreateIndex
CREATE INDEX "campaign_invitations_campaign_id_email_idx" ON "campaign_invitations"("campaign_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_code_key" ON "campaigns"("code");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_invitations" ADD CONSTRAINT "campaign_invitations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
