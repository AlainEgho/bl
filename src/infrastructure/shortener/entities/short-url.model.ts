import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserModel } from './user.model';

@Entity('short_urls')
export class ShortUrlModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'short_code', nullable: false, unique: true, length: 32 })
  shortCode: string;

  @Column({ name: 'full_url', nullable: false, length: 2048 })
  fullUrl: string;

  @ManyToOne(() => UserModel, { lazy: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: Promise<UserModel> | UserModel | null;

  @Column({ name: 'click_count', nullable: false, default: 0 })
  clickCount: number;

  @CreateDateColumn({ name: 'created_at', update: false })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt: Date | null;

  @Column({ nullable: false, default: true })
  active: boolean;
}
