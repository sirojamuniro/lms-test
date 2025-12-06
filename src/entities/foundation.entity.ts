import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { School } from './school.entity';

/**
 * Foundation entity - Yayasan Pendidikan
 * Manages multiple schools
 */
@Entity('foundations')
export class Foundation {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Foundation name (e.g., 'Yayasan Pendidikan ABC')
     */
    @Column()
    name: string;

    /**
     * Unique foundation code
     */
    @Column({ unique: true })
    code: string;

    /**
     * Legal name for formal documents
     */
    @Column({ nullable: true })
    legalName: string;

    /**
     * Foundation address
     */
    @Column({ type: 'text', nullable: true })
    address: string;

    /**
     * Contact phone
     */
    @Column({ nullable: true })
    phone: string;

    /**
     * Contact email
     */
    @Column({ nullable: true })
    email: string;

    /**
     * Website URL
     */
    @Column({ nullable: true })
    website: string;

    /**
     * Logo URL
     */
    @Column({ nullable: true })
    logoUrl: string;

    /**
     * Whether foundation is active
     */
    @Column({ default: true })
    isActive: boolean;

    /**
     * Additional settings/configuration
     */
    @Column({ type: 'json', nullable: true })
    settings: Record<string, any>;

    /**
     * Schools under this foundation
     */
    @OneToMany(() => School, (school) => school.foundation)
    schools: School[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
