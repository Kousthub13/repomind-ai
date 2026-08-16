import { Body, Controller, Delete, Post, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Get, Param } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
    constructor(private projectsService: ProjectsService) { }

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

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllProjects(@Req() req: any) {
        // console.log(req.user);
        return this.projectsService.getAllProjects(
            req.user.userId,
        );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getProjectById(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.projectsService.getProjectById(
            id,
            req.user.userId,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteProject(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.projectsService.deleteProject(
            id,
            req.user.userId,
        );
    }

    @Post(':id/index')
    async indexProject(
        @Param('id') projectId: string,
    ) {
        return this.projectsService.indexProject(projectId);
    }

}