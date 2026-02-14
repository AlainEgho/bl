import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('short_urls')
export class ShortUrlModel {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ name: 'short_code', length: 32, unique: true })
  shortCode: string;

  @Column({ name: 'original_url', type: 'varchar', length: 2048 })
  originalUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
