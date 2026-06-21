import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService){}

    async createProject(createProjectDto: CreateProjectDto){
        return this.prisma.project.create({
            data: {
                name: createProjectDto.name,
                githubUrl: createProjectDto.githubUrl,
            },
        });
    }

    async getAllProjects() {
        return this.prisma.project.findMany();
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
}
