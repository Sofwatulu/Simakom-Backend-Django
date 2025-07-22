-- CreateTable
CREATE TABLE "Komputer" (
    "id" SERIAL NOT NULL,
    "kodeKomputer" TEXT NOT NULL,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "lastPing" TIMESTAMP(3),
    "lastOnline" TIMESTAMP(3),
    "ipAddress" TEXT,

    CONSTRAINT "Komputer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Komputer_kodeKomputer_key" ON "Komputer"("kodeKomputer");
