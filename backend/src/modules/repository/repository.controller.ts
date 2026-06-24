import { Body, Controller, Post } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { RepositoryDto } from './dto/repository.dto';

@Controller('repository')

export class RepositoryController {
    constructor(
        private repositoryService: RepositoryService,
    ){}

    @Post('info')
    async getRepositoryInfo(
        @Body() respositoryDTO: RepositoryDto,
    ) {
        return this.repositoryService.getRepositoryInfo(
            respositoryDTO,
        );
    }
}
