import { on } from "events";
import {Entity, PrimaryGeneratedColumn, Column, ManyToMany} from "typeorm";
import { Users } from "./Users.js";
@Entity("Situations")
export class Situations {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({unique: true})
    nameSituation!: string;

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    createdAt!: Date;

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    updatedAt!: Date;

    @ManyToMany(() => Users, (user) => user.situations)
    users!: Users[];
}