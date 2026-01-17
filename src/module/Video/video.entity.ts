import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Video implements IVideo {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "video_url", type: "varchar" })
  videoUrl!: string;

  @Column({ name: "thumbnail_url", type: "varchar" })
  thumbnailUrl!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "title", type: "varchar" })
  title!: string;

  @Column({ name: "description", type: "varchar" })
  description!: string;

  @Column({ name: "duration", type: "float" })
  duration!: number;

  @Column({ name: "is_published", type: "boolean", default: false })
  isPublished!: boolean;

  constructor(it?: IVideo) {
    if (it) {
      this.id = it.id;
      this.videoUrl = it.videoUrl;
      this.thumbnailUrl = it.thumbnailUrl;
      this.userId = it.userId;
      this.title = it.title;
      this.description = it.description;
      this.isPublished = it.isPublished;
    }
  }
}

export interface IVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  userId: string;
  title: string;
  description: string;
  duration: number;
  isPublished: boolean;
}
