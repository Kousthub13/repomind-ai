import {
    Body,
    Controller,
    Param,
    Post,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';

@Controller('projects')
export class SearchController {
    constructor(
        private readonly searchService: SearchService,
    ) {}

    @Post(':id/search')
    async search(
        @Param('id') projectId: string,
        @Body() searchDto: SearchDto,
    ) {
        return this.searchService.search(
            projectId,
            searchDto.query,
        );
    }
}