import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Situations } from "./Situations.js";

@Entity("Users")
export class Users {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nameUsers!: string;

    @Column({ unique: true })
    email!: string;

    @ManyToOne(() => Situations, (situation) => situation.users)
    @JoinColumn({ name: "situationId" })
    situation!: Situations;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}