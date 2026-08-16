import {
    Body,
    Controller,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
export class SearchController {
    constructor(
        private readonly searchService: SearchService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post(':id/search')
    async search(
        @Param('id') projectId: string,
        @Body() searchDto: SearchDto,
        @Req() req: any,
    ) {
        return this.searchService.search(
            projectId,
            req.user.userId,
            searchDto.query,
        );
    }
}