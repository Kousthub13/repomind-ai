import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RepositoryDto } from './dto/repository.dto';

@Injectable()
export class RepositoryService {
    constructor(private httpService: HttpService){}

    async getRepositoryInfo(repositoryDto: RepositoryDto){
        const githubUrl = repositoryDto.githubUrl;

        const parts = githubUrl.split('/');

        const owner = parts[3];
        const repo = parts[4];
        
        const response = await firstValueFrom(
            this.httpService.get(
                `https://api.github.com/repos/${owner}/${repo}`,
            ),
        );

        return {
            name: response.data.name,
            owner: response.data.owner.login,
            stars: response.data.stargazers_count,
            forks: response.data.forks_count,
            description: response.data.description,
        };
    }
}
