import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from './user.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';

/**
 * Attendance status enum
 */
export enum AttendanceStatus {
    PRESENT = 'present',      // Hadir
    ABSENT = 'absent',        // Tidak Hadir
    LATE = 'late',            // Terlambat
    EXCUSED = 'excused',      // Izin
    SICK = 'sick',            // Sakit
}

/**
 * Attendance entity - Absensi per hari/pertemuan
 */
@Entity('attendance')
@Index(['studentId', 'classId', 'date'])
@Index(['classId', 'date'])
export class Attendance {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Date of attendance
     */
    @Column({ type: 'date' })
    date: Date;

    /**
     * Attendance status
     */
    @Column({
        type: 'enum',
        enum: AttendanceStatus,
        default: AttendanceStatus.PRESENT,
    })
    status: AttendanceStatus;

    /**
     * Check-in time (if applicable)
     */
    @Column({ type: 'time', nullable: true })
    checkInTime: string;

    /**
     * Check-out time (if applicable)
     */
    @Column({ type: 'time', nullable: true })
    checkOutTime: string;

    /**
     * Notes/reason for absence
     */
    @Column({ type: 'text', nullable: true })
    notes: string;

    /**
     * Minutes late (if status is LATE)
     */
    @Column({ default: 0 })
    minutesLate: number;

    /**
     * Supporting document URL (e.g., sick letter)
     */
    @Column({ nullable: true })
    documentUrl: string;

    /**
     * Student
     */
    @Column()
    studentId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'studentId' })
    student: User;

    /**
     * Class
     */
    @Column()
    classId: number;

    @ManyToOne(() => Class, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'classId' })
    class: Class;

    /**
     * Subject (optional - for per-subject attendance)
     */
    @Column({ nullable: true })
    subjectId: number;

    @ManyToOne(() => Subject, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subjectId' })
    subject: Subject;

    /**
     * Recorded by (teacher)
     */
    @Column({ nullable: true })
    recordedById: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'recordedById' })
    recordedBy: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
