import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
      private prisma: PrismaService,
      private jwtService: JwtService,
      ) {}

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

        const payload = {
          sub: user.id,
          email: user.email,
        };

        return {
          access_token: this.jwtService.sign(payload),
        };
    }
}