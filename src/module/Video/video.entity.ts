import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../User/user.entity";

@Entity()
export class Video {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "video_file", type: "text" })
  videoFile!: string;

  @Column({ name: "thumbnail", type: "text" })
  thumbnail!: string;

  @Column({ name: "owner", type: "varchar" })
  owner!: string;

  @Column({ name: "title", type: "varchar" })
  title!: string;

  @Column({ name: "description", type: "text" })
  description!: string;

  @Column({ name: "duration", type: "float" })
  duration!: number;

  @Column({ name: "views", type: "int", default: 0 })
  views!: number;

  @Column({ name: "is_published", type: "boolean", default: false })
  isPublished!: boolean;

  @ManyToMany(() => User, (user) => user.watchHistory)
  viewers!: User[];
}
