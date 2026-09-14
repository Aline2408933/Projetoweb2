import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinColumn} from "typeorm";
import { Situations } from "./Situations.js";
@Entity("Users")
export class Users {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nameUser!: string;

    @Column({unique: true})
    email!: string;

    @ManyToMany(() => Situations, (situation) => situation.users)
    @JoinColumn({name: "situationId",})
    situations!: Situations[];

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    createdAt!: Date;

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updatedAt!: Date;
}