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
import { Class } from './class.entity';

/**
 * AcademicYear entity - Tahun Ajaran
 */
@Entity('academic_years')
@Index(['schoolId', 'name'], { unique: true })
export class AcademicYear {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Academic year name (e.g., '2024/2025')
     */
    @Column()
    name: string;

    /**
     * Start date of academic year
     */
    @Column({ type: 'date' })
    startDate: Date;

    /**
     * End date of academic year
     */
    @Column({ type: 'date' })
    endDate: Date;

    /**
     * Whether this is the current active academic year
     */
    @Column({ default: false })
    isCurrent: boolean;

    /**
     * Semester information
     */
    @Column({ type: 'json', nullable: true })
    semesters: {
        name: string;
        startDate: string;
        endDate: string;
    }[];

    /**
     * Whether the academic year is active
     */
    @Column({ default: true })
    isActive: boolean;

    /**
     * School this academic year belongs to
     */
    @Column()
    schoolId: number;

    @ManyToOne(() => School, (school) => school.academicYears, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'schoolId' })
    school: School;

    /**
     * Classes for this academic year
     */
    @OneToMany(() => Class, (cls) => cls.academicYear)
    classes: Class[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
