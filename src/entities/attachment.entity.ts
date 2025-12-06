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
import { AttachmentType, EntityType } from '../types';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';
import { User } from './user.entity';

@Entity('attachments')
@Index(['entityType', 'entityId'])
export class Attachment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    filename: string;

    @Column()
    originalFilename: string;

    @Column()
    filePath: string;

    @Column()
    mimeType: string;

    @Column({ type: 'bigint', default: 0 })
    fileSize: number;

    @Column({
        type: 'enum',
        enum: AttachmentType,
        default: AttachmentType.FILE,
    })
    type: AttachmentType;

    @Column({
        type: 'enum',
        enum: EntityType,
    })
    entityType: EntityType;

    @Column()
    entityId: number;

    @Column({ nullable: true })
    courseId: number;

    @ManyToOne(() => Course, (course) => course.attachments, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'courseId' })
    course: Course;

    @Column({ nullable: true })
    lessonId: number;

    @ManyToOne(() => Lesson, (lesson) => lesson.attachments, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'lessonId' })
    lesson: Lesson;

    @Column()
    uploadedById: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'uploadedById' })
    uploadedBy: User;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
