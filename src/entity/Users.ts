import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import { Situations } from "./Situations.js";
import bcrypt from "bcryptjs";

@Entity("Users")
export class Users {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nameUsers!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

     @Column({ unique: true })
    recoverPassword!: string;

    @ManyToOne(() => Situations, (situation) => situation.users)
    @JoinColumn({ name: "situationId" })
    situation!: Situations;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void>
    {
        if(this.password){
           this.password = await bcrypt.hash(this.password, 10)
        }
    }
    async comparePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}