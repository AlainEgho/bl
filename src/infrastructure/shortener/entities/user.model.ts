import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ShortUrlModel } from './short-url.model';

@Entity('users')
export class UserModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  email: string;

  @OneToMany(() => ShortUrlModel, (shortUrl) => shortUrl.user)
  shortUrls: ShortUrlModel[];
}
