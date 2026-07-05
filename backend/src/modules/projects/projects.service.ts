import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { RepositoryService } from '../repository/repository.service';
import { EmbeddingService } from '../embedding/embedding.service';

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

        const chunks = await this.repositoryService.getRepositorySourceCode({
            githubUrl: project.githubUrl,
        })

        for(const chunk of chunks) {
            const embedding = await this.embeddingService.generateEmbedding(
                chunk.chunk,
            );

            await this.prisma.codeEmbedding.create({
                data: {
                    path: chunk.path,
                    chunk: chunk.chunk,
                    chunkIndex: chunk.chunkIndex,
                    embedding,
                    projectId: project.id,
                },
            });
        }

        return {
            message: 'Project indexed successfully',
            totalChunks: chunks.length,
        };
    }
}
