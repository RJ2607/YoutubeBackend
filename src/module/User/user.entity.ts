import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User  {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

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

  @Column({ name: "watch_history_id", type: "jsonb"})
  watchHistoryId!: string[];
}


export interface IUser {
  id: string;
  userName: string;
  email?: string | null;
  fullName?: string;
  avatar: string;
  coverImage: string;
}