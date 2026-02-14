import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('shorteners')
export class ShortUrlModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'short_code', nullable: false, unique: true, length: 32 })
  shortCode: string;

  @Column({ name: 'full_url', nullable: false, length: 2048 })
  fullUrl: string;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'click_count', nullable: false, default: 0 })
  clickCount: number;

  @CreateDateColumn({ name: 'created_at', update: false })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt: Date | null;

  @Column({ nullable: false, default: true })
  active: boolean;
}
