import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Discussion } from './discussion.entity';
import { User } from './user.entity';

@Entity('discussion_replies')
export class DiscussionReply {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    content: string;

    @Column({ nullable: true })
    parentId: number;

    @ManyToOne(() => DiscussionReply, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parentId' })
    parent: DiscussionReply;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column()
    discussionId: number;

    @ManyToOne(() => Discussion, (discussion) => discussion.replies, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'discussionId' })
    discussion: Discussion;

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
