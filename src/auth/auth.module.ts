import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CurrentUserService } from './current-user.service';
import { ValidateTokenGuard } from './validate-token.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [CurrentUserService, ValidateTokenGuard],
  exports: [CurrentUserService],
})
export class AuthModule {}
