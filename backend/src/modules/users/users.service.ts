import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async createUser(createUserDto: CreateUserDto) {
        
        const hashedPassword = await bcrypt.hash(
            createUserDto.password,
            10,
        );
        return this.prisma.user.create({
            data: {
                email: createUserDto.email,
                password: hashedPassword,
            },
        });
    }

}