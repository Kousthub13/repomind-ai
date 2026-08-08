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
    ){}

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

    async getProjectById(id: string) {
        return this.prisma.project.findUnique({
            where: {
                id,
            },
        });
    }

    async deleteProject(id: string) {
        return this.prisma.project.delete({
            where: {
                id,
            },
        });
    }

    async indexProject(projectId: string) {
        const project = await this.prisma.project.findUnique({
            where: {
                id: projectId,
            },
        });

        if(!project) {
            throw new NotFoundException('Project not found');
        }

        await this.prisma.codeEmbedding.deleteMany({
            where: {
                projectId,
            },
        });

        const chunks = await this.repositoryService.getRepositorySourceCode({
            githubUrl: project.githubUrl,
        })

        for(const chunk of chunks) {
            const embedding = await this.embeddingService.generateEmbedding(
                chunk.chunk,
            );

            const codeEmbedding = await this.prisma.codeEmbedding.create({
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

        return {
            message: 'Project indexed successfully',
            totalChunks: chunks.length,
        };
    }
}
