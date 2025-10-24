import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Video } from "../Video/video.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToMany(() => Video, (video) => video.viewers)
  @JoinTable({
    name: "watch_history",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "video_id", referencedColumnName: "id" },
  })
  watchHistory!: Video[];

  @Column({ name: "username", type: "varchar", unique: true })
  @Index({ unique: true })
  userName!: string;

  @Column({ name: "email", type: "varchar", length: 500, nullable: true })
  email!: string | null;

  @Column({ name: "fullname", type: "varchar", nullable: true })
  fullName?: string;

  @Column({ name: "avatar", type: "text" })
  avatar!: string;

  @Column({ name: "cover_image", type: "text" })
  coverImage!: string;

  @Column({ name: "password", type: "varchar", nullable: true, select: false })
  password?: string | null;

  @Column({ name: "refresh_token", type: "varchar", nullable: true })
  refreshToken!: string | null;

}
