-- CreateTable
CREATE TABLE "balances" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "balances_pkey" PRIMARY KEY ("id")
);
