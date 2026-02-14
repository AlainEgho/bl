import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateShortUrlDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  @MaxLength(2048)
  url: string;
}
