import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RepositoryDto } from './dto/repository.dto';
import { CodeChunk } from './interfaces/code-chunk.interface';
import { ChunkingService } from '../chunking/chunking.service';

@Injectable()

export class RepositoryService {
    constructor(
        private httpService: HttpService,
        private readonly chunkingService: ChunkingService,
    ){}

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

    private async githubGet(
        url: string,
        config: any = {},
    ): Promise<any> {
        const MAX_RETRIES = 3;
    
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                return await firstValueFrom(
                    this.httpService.get(url, {
                        ...config,
                        headers: {
                            ...this.getGithubHeaders(),
                            ...(config.headers || {}),
                        },
                        timeout: 15000,
                    }),
                );
            } catch (error) {
                console.error(
                    `GitHub request failed (attempt ${attempt}/${MAX_RETRIES}):`,
                    url,
                    error instanceof Error ? error.message : error,
                );
    
                if (attempt === MAX_RETRIES) {
                    throw error;
                }
    
                await new Promise((resolve) =>
                    setTimeout(resolve, 1000 * attempt),
                );
            }
        }
    
        throw new Error('GitHub request failed.');
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

        const response = await this.githubGet(
            `https://api.github.com/repos/${owner}/${repo}/contents/${repositoryDto.filePath}`,
            {
                headers: {
                    Accept: 'application/vnd.github.raw',
                },
            },
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
        const response = await this.githubGet(
            `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
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

        const chunks: CodeChunk[] = [];
        
        for (const file of sourceFiles) {
        
            const fileContent =
                await this.getFileContent({
                    githubUrl: repositoryDto.githubUrl,
                    filePath: file,
                });
            
            chunks.push(
                ...this.chunkingService.chunkContent(
                    fileContent.path!,
                    fileContent.content,
                ),
            );
        }

        return chunks;
    }

    // private readonly CHUNK_SIZE = 100;

    // private chunkContent(
    //     path: string,
    //     content: string,
    // ): CodeChunk[] {
    //     const lines = content.split('\n');
        

    //     const chunks: CodeChunk[] = [];

    //     let index = 0;

    //     for (let i = 0; i < lines.length; i += this.CHUNK_SIZE) {
    //         chunks.push({
    //             path,
    //             chunk: lines
    //                 .slice(i, i + this.CHUNK_SIZE)
    //                 .join('\n'),
    //             chunkIndex: index++,
    //         });
    //     }
    //     return chunks;
    // }


}