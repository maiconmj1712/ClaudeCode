import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

class LoginDto {
  @IsEmail() email: string
  @IsString() @MinLength(6) password: string
}

class RegisterClinicDto {
  @IsString() @IsNotEmpty() cnpj: string
  @IsString() @IsNotEmpty() razaoSocial: string
  @IsEmail() email: string
  @IsString() @IsNotEmpty() phone: string
  @IsString() @IsNotEmpty() contactName: string
  @IsString() @MinLength(8) password: string
}

class RefreshDto {
  @IsString() @IsNotEmpty() refreshToken: string
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } }) // 10 tentativas/min
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password)
  }

  @Post('register-clinic')
  @Throttle({ default: { ttl: 3_600_000, limit: 5 } }) // 5 registros/hora por IP
  registerClinic(@Body() dto: RegisterClinicDto) {
    return this.auth.registerClinic(dto)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken)
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Req() req: any, @Body() dto: { refreshToken?: string }) {
    return this.auth.logout(req.user.sub, dto.refreshToken)
  }
}
