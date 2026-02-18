import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateShortUrlDto {
  @ApiProperty({ example: 'https://example.com', maxLength: 2048 })
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  @MaxLength(2048)
  url: string;
}
