import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Products")
export class Products {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    productCategoryId!: number;

    @Column()
    productSituationId!: number;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    createdAt!: Date;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP"
    })
    updatedAt!: Date;
}
``