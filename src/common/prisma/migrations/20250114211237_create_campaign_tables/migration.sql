-- CreateTable
CREATE TABLE "campaigns" (
    "id" SERIAL NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "endDate" TIMESTAMPTZ(6),
    "startDate" TIMESTAMPTZ(6),
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "campaignType" TEXT NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_users" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "campaign_id" INTEGER NOT NULL,
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

-- CreateIndex
CREATE INDEX "campaign_users_user_id_campaign_id_idx" ON "campaign_users"("user_id", "campaign_id");

-- CreateIndex
CREATE INDEX "campaign_transactions_campaign_id_transaction_id_idx" ON "campaign_transactions"("campaign_id", "transaction_id");

-- AddForeignKey
ALTER TABLE "campaign_users" ADD CONSTRAINT "campaign_users_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_users" ADD CONSTRAINT "campaign_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_transactions" ADD CONSTRAINT "campaign_transactions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_transactions" ADD CONSTRAINT "campaign_transactions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
