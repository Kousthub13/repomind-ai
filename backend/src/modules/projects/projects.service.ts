import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { RepositoryService } from '../repository/repository.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ProjectsService {
    constructor(
        private prisma: PrismaService,
        private repositoryService: RepositoryService,
        private embeddingService: EmbeddingService,
    ) { }

    async createProject(
        createProjectDto: CreateProjectDto,
        userId: string,
    ) {
        return this.prisma.project.create({
            data: {
                name: createProjectDto.name,
                githubUrl: createProjectDto.githubUrl,
                userId,
            },
        });
    }

    async getAllProjects(userId: string) {
        return this.prisma.project.findMany({
            where: {
                userId,
            },
        });
    }

    async getProjectById(id: string, userId: string) {
        const project = await this.prisma.project.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                embeddings: {
                    select: {
                        id: true,
                    },
                    take: 1,
                },
            },
        });

        if (!project) {
            return null;
        }

        return {
            id: project.id,
            name: project.name,
            githubUrl: project.githubUrl,
            createdAt: project.createdAt,
            isIndexed: project.embeddings.length > 0,
        };
    }

    async deleteProject(id: string, userId: string) {
        const project = await this.prisma.project.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!project) {
            throw new NotFoundException("Project not found");
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`
                DELETE FROM code_embedding_vectors
                WHERE id IN (
                    SELECT id
                    FROM "CodeEmbedding"
                    WHERE "projectId" = ${id}
                )
            `;

            await tx.codeEmbedding.deleteMany({
                where: {
                    projectId: id,
                },
            });

            await tx.project.delete({
                where: {
                    id,
                },
            });
        });

        return {
            message: "Project deleted successfully",
        };
    }

    async indexProject(projectId: string) {
        const project = await this.prisma.project.findUnique({
            where: {
                id: projectId,
            },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        await this.prisma.$executeRaw`
            DELETE FROM code_embedding_vectors
            WHERE id IN (
                SELECT id
                FROM "CodeEmbedding"
                WHERE "projectId" = ${projectId}
            )
        `;

        await this.prisma.codeEmbedding.deleteMany({
            where: {
                projectId,
            },
        });

        const chunks =
            await this.repositoryService.getRepositorySourceCode({
                githubUrl: project.githubUrl,
            });

        const BATCH_SIZE = 20;

        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batch = chunks.slice(i, i + BATCH_SIZE);

            const existingChunks =
                await this.prisma.codeEmbedding.findMany({
                    where: {
                        projectId,
                        chunkIndex: {
                            in: batch.map((chunk) => chunk.chunkIndex),
                        },
                    },
                    select: {
                        chunkIndex: true,
                    },
                });

            const existingChunkIndexes = new Set(
                existingChunks.map((chunk) => chunk.chunkIndex),
            );

            const chunksToProcess = batch.filter(
                (chunk) => !existingChunkIndexes.has(chunk.chunkIndex),
            );

            if (chunksToProcess.length === 0) {
                console.log(`Batch ${i} already indexed. Skipping.`);
                continue;
            }

            console.log(
                `Embedding batch: ${i} - ${i + batch.length - 1
                } of ${chunks.length}`,
            );

            const embeddings =
                await this.embeddingService.generateEmbeddings(
                    chunksToProcess.map((chunk) => chunk.chunk),
                );

            for (let j = 0; j < chunksToProcess.length; j++) {
                const chunk = chunksToProcess[j];
                const embedding = embeddings[j];

                const codeEmbedding =
                    await this.prisma.codeEmbedding.create({
                        data: {
                            path: chunk.path,
                            chunk: chunk.chunk,
                            chunkIndex: chunk.chunkIndex,
                            embedding,
                            projectId: project.id,
                        },
                    });

                const vector = `[${embedding.join(",")}]`;

                await this.prisma.$executeRaw`
                    INSERT INTO code_embedding_vectors (id, embedding)
                    VALUES (${codeEmbedding.id}, ${vector}::vector)
                `;
            }
        }

        return {
            message: 'Project indexed successfully',
            totalChunks: chunks.length,
        };
    }
}
