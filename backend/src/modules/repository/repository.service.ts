import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RepositoryDto } from './dto/repository.dto';

@Injectable()
export class RepositoryService {
    constructor(private httpService: HttpService){}

    private extractRepositoryInfo(githubUrl: string){
        const parts = githubUrl.split('/');

        return{
            owner: parts[3],
            repo: parts[4],
        };
    }

    private getGithubHeaders() {
        return {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        };
    }

    async getRepositoryInfo(repositoryDto: RepositoryDto){
        const githubUrl = repositoryDto.githubUrl;
        
        const { owner, repo } = this.extractRepositoryInfo(repositoryDto.githubUrl);

        const response = await firstValueFrom(
            this.httpService.get(
                `https://api.github.com/repos/${owner}/${repo}`,
                {
                    headers: this.getGithubHeaders(),
                },
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

    async getRepositoryContents(repositoryDto: RepositoryDto) {
        const githubUrl = repositoryDto.githubUrl;

        const { owner, repo } = this.extractRepositoryInfo(repositoryDto.githubUrl);

        const response  = await firstValueFrom(
            this.httpService.get(
                `https://api.github.com/repos/${owner}/${repo}/contents`,
            ),
        );
        return response.data.map((item: any) =>({
            name: item.name,
            type: item.type,
        }))
    }

    async getReadMe(repositoryDto: RepositoryDto){
        const githubUrl = repositoryDto.githubUrl;

        const { owner, repo } = this.extractRepositoryInfo(repositoryDto.githubUrl);

        const response = await firstValueFrom(
            this.httpService.get(
                `https://api.github.com/repos/${owner}/${repo}/readme`,
                {
                    headers: {
                        ...this.getGithubHeaders(),
                        Accept: 'application/vnd.github.raw',
                    }
                },
            ),
        );

        return{
            content: response.data,
        };
    }

    async getFileContent(repositoryDto: RepositoryDto){
        const githubUrl = repositoryDto.githubUrl;

        const { owner, repo } = this.extractRepositoryInfo(repositoryDto.githubUrl);

        const response = await firstValueFrom(
            this.httpService.get(
                `https://api.github.com/repos/${owner}/${repo}/contents/${repositoryDto.filePath}`,
                {
                    headers: {
                        ...this.getGithubHeaders(),
                       Accept: 'application/vnd.github.raw',
                    },
                },
            ),
        );

        return{
            path: repositoryDto.filePath,
            content: response.data,
        };
    }

    private async collectSourceFiles(
        owner: string,
        repo: string,
        path = '',
    ): Promise<string[]> {
        const response = await firstValueFrom(
            this.httpService.get(
                `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
                {
                    headers: this.getGithubHeaders(),
                },
            ),
        );

        const files: string[] = [];

        for (const item of response.data) {
            if(item.type === 'file'){
                if(
                    item.name.endsWith('.ts') ||
                    item.name.endsWith('.js') ||
                    item.name.endsWith('.tsx') ||
                    item.name.endsWith('.jsx')
                ){
                    files.push(item.path);
                }
            }
            else if(item.type === 'dir'){
                const nestedFiles = await this.collectSourceFiles(
                    owner,
                    repo,
                    item.path,
                );
                files.push(...nestedFiles);
            }
        }
        return files;
    }

    async getSourceFiles(repositoryDto: RepositoryDto){
        const { owner, repo } = this.extractRepositoryInfo(
            repositoryDto.githubUrl
        );

        return this.collectSourceFiles(owner, repo);
    }

    async getRepositorySourceCode(
        repositoryDto: RepositoryDto,
    ) {
        const sourceFiles = await this.getSourceFiles(repositoryDto);
        
        console.log(sourceFiles);
        
        const sourceCode: {
            path: string | undefined;
            content: any;
        }[] = [];
        
        for (const file of sourceFiles) {
        
            const fileContent =
                await this.getFileContent({
                    githubUrl: repositoryDto.githubUrl,
                    filePath: file,
                });
            
            sourceCode.push(fileContent);
        }

        return sourceCode;
    }

}