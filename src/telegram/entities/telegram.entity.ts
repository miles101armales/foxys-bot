import { Referral } from 'src/referral/entities/referral.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Telegram {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', nullable: true })
  chat_id: string;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column({ default: 0 })
  point_balance: number;

  @Column({ type: 'bigint', nullable: true })
  referrer: number;

  @OneToMany(() => Referral, (referral) => referral.referringUser)
  referrals: Referral[];

  @Column({ default: 0 })
  referrals_bonus: number;

  @Column({ default: 'client' })
  role: 'client' | 'influencer' | 'admin';

  @Column({ default: 0 })
  success_tasks: number;
}
