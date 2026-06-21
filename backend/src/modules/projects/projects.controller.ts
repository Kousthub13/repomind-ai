import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Get, Param } from '@nestjs/common';

@Controller('projects')
export class ProjectsController {
    constructor(private projectsService: ProjectsService) {}

    @Post()
    async createProject(@Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.createProject(createProjectDto);
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