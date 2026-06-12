-- CreateEnum
CREATE TYPE "integration_provider_type" AS ENUM ('WALLET', 'PAYMENT', 'CHECKOUT', 'TICKETING', 'LIVE_DATA', 'SPONSOR_ACTIVATION', 'REWARDS_REDEMPTION', 'NOTIFICATIONS', 'ANALYTICS');

-- CreateEnum
CREATE TYPE "integration_provider_mode" AS ENUM ('MOCK', 'SANDBOX', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "integration_provider_status" AS ENUM ('NOT_CONFIGURED', 'PROVIDER_REQUIRED', 'CONTRACT_REQUIRED', 'COMPLIANCE_REQUIRED', 'SANDBOX_READY', 'INTEGRATION_READY', 'PRODUCTION_DISABLED', 'ENABLED');

-- CreateTable
CREATE TABLE "integration_provider_configs" (
    "id" TEXT NOT NULL,
    "provider_type" "integration_provider_type" NOT NULL,
    "provider_key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "mode" "integration_provider_mode" NOT NULL DEFAULT 'MOCK',
    "status" "integration_provider_status" NOT NULL DEFAULT 'NOT_CONFIGURED',
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_production_enabled" BOOLEAN NOT NULL DEFAULT false,
    "requires_compliance_approval" BOOLEAN NOT NULL DEFAULT false,
    "requires_contract_approval" BOOLEAN NOT NULL DEFAULT false,
    "last_health_check_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_provider_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integration_provider_configs_provider_key_key" ON "integration_provider_configs"("provider_key");
