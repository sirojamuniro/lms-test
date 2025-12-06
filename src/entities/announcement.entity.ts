import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { User } from './user.entity';

@Entity('announcements')
export class Announcement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ default: false })
    isPinned: boolean;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    publishedAt: Date;

    @Column({ nullable: true })
    expiresAt: Date;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column()
    courseId: number;

    @ManyToOne(() => Course, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'courseId' })
    course: Course;

    @Column()
    authorId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'authorId' })
    author: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
