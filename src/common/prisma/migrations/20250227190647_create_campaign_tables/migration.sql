-- CreateTable
CREATE TABLE "campaigns" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shortDescription" VARCHAR(100) NOT NULL,
    "longDescription" TEXT NOT NULL,
    "campaignType" TEXT NOT NULL,
    "startDate" TIMESTAMPTZ(6),
    "endDate" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_users" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'member',
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_transactions" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "balance_after" DECIMAL(65,30) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_invitations" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "token" VARCHAR(20) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_code_key" ON "campaigns"("code");

-- CreateIndex
CREATE INDEX "campaign_users_user_id_campaign_id_idx" ON "campaign_users"("user_id", "campaign_id");

-- CreateIndex
CREATE INDEX "campaign_transactions_campaign_id_transaction_id_idx" ON "campaign_transactions"("campaign_id", "transaction_id");

-- CreateIndex
CREATE INDEX "campaign_invitations_campaign_id_email_idx" ON "campaign_invitations"("campaign_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_invitations_token_key" ON "campaign_invitations"("token");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_users" ADD CONSTRAINT "campaign_users_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_users" ADD CONSTRAINT "campaign_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_transactions" ADD CONSTRAINT "campaign_transactions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_transactions" ADD CONSTRAINT "campaign_transactions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_invitations" ADD CONSTRAINT "campaign_invitations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
