import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";

import { ProductCategories } from "./ProductCategories.js";
import { ProductSituations } from "./ProductSituations.js";

@Entity("Products")
export class Products {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    slug!: string;

    @Column()
    description!: string;

    @Column("decimal", {
        precision: 10,
        scale: 2
    })
    price!: number;

    @ManyToOne(() => ProductCategories)
    @JoinColumn({
        name: "productCategoryId"
    })
    productCategory!: ProductCategories;

    @ManyToOne(() => ProductSituations)
    @JoinColumn({
        name: "productSituationId"
    })
    productSituation!: ProductSituations;

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