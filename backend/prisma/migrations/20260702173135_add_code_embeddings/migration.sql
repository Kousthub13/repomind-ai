-- CreateTable
CREATE TABLE "CodeEmbedding" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "chunk" TEXT NOT NULL,
    "ChunkIndex" INTEGER NOT NULL,
    "embedding" JSONB NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeEmbedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CodeEmbedding" ADD CONSTRAINT "CodeEmbedding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
