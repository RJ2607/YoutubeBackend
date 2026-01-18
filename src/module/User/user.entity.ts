import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'users' })
export class User implements IUser {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Column({ name: 'username', type: 'varchar', unique: true, nullable: true })
	@Index({ unique: true })
	userName!: string

	@Column({ name: 'email', type: 'varchar' })
	email!: string | null

	@Column({ name: 'full_name', type: 'varchar', nullable: true })
	fullName!: string

	@Column({ name: 'avatar', type: 'varchar', nullable: true })
	avatar!: string

	@Column({ name: 'cover_image', type: 'varchar', nullable: true })
	coverImage!: string

	@Column({ name: 'password', type: 'varchar' })
	password!: string

	constructor(it?: IUser) {
		if (it) {
			if (it.id) this.id = it.id
			this.userName = it.userName
			this.email = it.email
			this.fullName = it.fullName
			this.avatar = it.avatar
			this.coverImage = it.coverImage
		}
	}
}

export interface IUser {
	id: string
	userName: string
	email?: string | null
	fullName?: string
	avatar: string
	coverImage: string
}
