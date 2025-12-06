import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { User } from './user.entity';
import { DiscussionReply } from './discussion-reply.entity';

@Entity('discussions')
export class Discussion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ default: false })
    isPinned: boolean;

    @Column({ default: false })
    isLocked: boolean;

    @Column({ default: 0 })
    viewCount: number;

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

    @OneToMany(() => DiscussionReply, (reply) => reply.discussion, { cascade: true })
    replies: DiscussionReply[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
