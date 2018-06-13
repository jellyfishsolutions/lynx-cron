import BaseEntity from "lynx-framework/entities/base.entity";
import { logger } from "lynx-framework/logger";

import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("cronjobs")
export default class CronJobEntity extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column({ type: "varchar", length: 60 })
    when: string;
    @Column({ type: "varchar", length: 1024 })
    endpoint: string;
    @Column() retry: number;

    static async removeJob(when: string, endpoint: string, retry: number) {
        try {
            let job = await CronJobEntity.findOne({
                where: { when: when, endpoint: endpoint, retry: retry }
            });
            if (job) {
                await CronJobEntity.remove(job);
            }
        } catch (e) {
            logger.error("error removing CronJob", e);
        }
    }
}
