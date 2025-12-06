import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    JoinTable,
    Index,
} from 'typeorm';
import { School } from './school.entity';
import { AcademicYear } from './academic-year.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';

/**
 * Class entity - Kelas (e.g., X-IPA-1, XI-IPS-2)
 */
@Entity('classes')
@Index(['schoolId', 'name', 'academicYearId'], { unique: true })
export class Class {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Class name (e.g., 'X-IPA-1', 'XI-IPS-2')
     */
    @Column()
    name: string;

    /**
     * Grade level (e.g., '10', '11', '12' for SMA)
     */
    @Column()
    grade: string;

    /**
     * Major/specialization if applicable (e.g., 'IPA', 'IPS')
     */
    @Column({ nullable: true })
    major: string;

    /**
     * Class number within the grade/major (e.g., '1', '2')
     */
    @Column({ nullable: true })
    classNumber: string;

    /**
     * Maximum capacity of students
     */
    @Column({ default: 30 })
    capacity: number;

    /**
     * Classroom location/room number
     */
    @Column({ nullable: true })
    room: string;

    /**
     * Whether class is active
     */
    @Column({ default: true })
    isActive: boolean;

    /**
     * Additional settings
     */
    @Column({ type: 'json', nullable: true })
    settings: Record<string, any>;

    /**
     * School this class belongs to
     */
    @Column()
    schoolId: number;

    @ManyToOne(() => School, (school) => school.classes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'schoolId' })
    school: School;

    /**
     * Academic year this class belongs to
     */
    @Column()
    academicYearId: number;

    @ManyToOne(() => AcademicYear, (ay) => ay.classes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'academicYearId' })
    academicYear: AcademicYear;

    /**
     * Homeroom teacher (Wali Kelas)
     */
    @Column({ nullable: true })
    homeroomTeacherId: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'homeroomTeacherId' })
    homeroomTeacher: User;

    /**
     * Students in this class (many-to-many)
     */
    @ManyToMany(() => User)
    @JoinTable({
        name: 'class_students',
        joinColumn: { name: 'classId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'studentId', referencedColumnName: 'id' },
    })
    students: User[];

    /**
     * Subjects taught in this class
     */
    @OneToMany(() => Subject, (subject) => subject.class)
    subjects: Subject[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
