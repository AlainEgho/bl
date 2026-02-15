import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * Metadata for an image uploaded as Base64 and saved on the server.
 * The image is accessible via short link /i/{shortCode}.
 * Table: image_uploads (matches existing DB; do not change schema).
 */
@Entity('image_uploads')
export class ImageUploadModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'short_code', nullable: false, unique: true, length: 32 })
  shortCode: string;

  /** Relative path under the upload root (e.g. "1/abc12"). */
  @Column({ name: 'file_path', nullable: false, length: 512 })
  filePath: string;

  @Column({ name: 'content_type', nullable: false, length: 100 })
  contentType: string;

  @Column({ name: 'original_file_name', type: 'varchar', length: 255, nullable: true })
  originalFileName: string | null;

  @Column({ name: 'user_id', type: 'int', nullable: false })
  userId: number;

  @CreateDateColumn({ name: 'created_at', update: false })
  createdAt: Date;
}
