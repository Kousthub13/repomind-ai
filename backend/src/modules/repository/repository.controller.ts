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

    @Post('contents')
    async getRepositoryContents(
      @Body() repositoryDto: RepositoryDto,
    ) {
      return this.repositoryService.getRepositoryContents(
        repositoryDto,
      );
    }

    @Post('readme')
    async getReadme(
      @Body() repositoryDto: RepositoryDto,
    ) {
      return this.repositoryService.getReadMe(repositoryDto);
    }

    @Post('file')
    async getFileContent(
        @Body() repositoryDto: RepositoryDto,
    ) {
        return this.repositoryService.getFileContent(
            repositoryDto,
        );
    }

    @Post('source-files')
    async getSourceFiles(
        @Body() repositoryDto: RepositoryDto,
    ) {
        return this.repositoryService.getSourceFiles(
            repositoryDto,
        );
    }

    
}