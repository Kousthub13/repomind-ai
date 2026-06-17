import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    async login(loginDto: LoginDto){

        console.log('Login DTO:', loginDto);

        const user = await this.prisma.user.findUnique({
            where: {
                email: loginDto.email,
              },
        });
    
        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }
        console.log('Stored Password:', user?.password);
    
        const isPasswordValid = await bcrypt.compare(
          loginDto.password,
          user.password,
        );
    
        console.log('Password Match:', isPasswordValid);
        
        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }
    
        return {
          message: 'Login successful',
          userId: user.id,
          email: user.email,
        };
    }
}