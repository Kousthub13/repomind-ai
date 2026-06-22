import { Body, Controller, Delete, Post, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Get, Param } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
    constructor(private projectsService: ProjectsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createProject(
        @Body() createProjectDto: CreateProjectDto,
        @Req() req: any,
    ) {
        return this.projectsService.createProject(
            createProjectDto,
            req.user.userId,
        );
    }

    @Get()
    async getAllProjects() {
        return this.projectsService.getAllProjects();
    }

    @Get(':id')
    async getProjectById(@Param('id') id: string) {
        return this.projectsService.getProjectById(id);
    }

    @Delete(':id')
    async deleteProject(@Param('id') id: string) {
        return this.projectsService.deleteProject(id);
    }

    
}