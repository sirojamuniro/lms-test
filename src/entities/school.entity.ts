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
import { Foundation } from './foundation.entity';
import { Class } from './class.entity';
import { AcademicYear } from './academic-year.entity';
import { Role } from './role.entity';

/**
 * School level enum
 */
export enum SchoolLevel {
    TK = 'TK',           // Taman Kanak-kanak
    SD = 'SD',           // Sekolah Dasar
    SMP = 'SMP',         // Sekolah Menengah Pertama
    SMA = 'SMA',         // Sekolah Menengah Atas
    SMK = 'SMK',         // Sekolah Menengah Kejuruan
    UNIVERSITY = 'UNIVERSITY',
}

/**
 * School entity - Sekolah
 */
@Entity('schools')
export class School {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * School name (e.g., 'SMA Negeri 1 Jakarta')
     */
    @Column()
    name: string;

    /**
     * Unique school code (e.g., 'SMAN1JKT')
     */
    @Column({ unique: true })
    code: string;

    /**
     * NPSN - Nomor Pokok Sekolah Nasional
     */
    @Column({ unique: true, nullable: true })
    npsn: string;

    /**
     * School level
     */
    @Column({
        type: 'enum',
        enum: SchoolLevel,
        default: SchoolLevel.SMA,
    })
    level: SchoolLevel;

    /**
     * School address
     */
    @Column({ type: 'text', nullable: true })
    address: string;

    /**
     * City
     */
    @Column({ nullable: true })
    city: string;

    /**
     * Province
     */
    @Column({ nullable: true })
    province: string;

    /**
     * Postal code
     */
    @Column({ nullable: true })
    postalCode: string;

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
     * School logo URL
     */
    @Column({ nullable: true })
    logoUrl: string;

    /**
     * School banner/header image
     */
    @Column({ nullable: true })
    bannerUrl: string;

    /**
     * Whether school is active
     */
    @Column({ default: true })
    isActive: boolean;

    /**
     * Custom branding settings (colors, theme, etc.)
     */
    @Column({ type: 'json', nullable: true })
    branding: {
        primaryColor?: string;
        secondaryColor?: string;
        fontFamily?: string;
    };

    /**
     * School settings/configuration
     */
    @Column({ type: 'json', nullable: true })
    settings: Record<string, any>;

    /**
     * Foundation this school belongs to
     */
    @Column({ nullable: true })
    foundationId: number;

    @ManyToOne(() => Foundation, (foundation) => foundation.schools, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'foundationId' })
    foundation: Foundation;

    /**
     * Classes in this school
     */
    @OneToMany(() => Class, (cls) => cls.school)
    classes: Class[];

    /**
     * Academic years for this school
     */
    @OneToMany(() => AcademicYear, (ay) => ay.school)
    academicYears: AcademicYear[];

    /**
     * Custom roles for this school
     */
    @OneToMany(() => Role, (role) => role.school)
    roles: Role[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
