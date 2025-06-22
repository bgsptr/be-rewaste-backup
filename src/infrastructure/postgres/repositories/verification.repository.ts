import { Verification } from "@prisma/client";
import { IVerificationRepository } from "src/core/interfaces/repositories/verification.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";
import DayConvertion from "src/utils/static/dayjs";

class VerificationRepository implements IVerificationRepository {
    constructor(
        private prisma: PrismaService,
    ) { }

    async create(data: Verification): Promise<Verification> {
        return await this.prisma.verification.create({
            data,
        })
    }

    async getAllTrashIdByVerificatorId(id: string): Promise<string[]> {
        const { todayStart: gte, todayEnd: lte } = DayConvertion.getStartAndEndForToday();
        const datas = await this.prisma.verification.findMany({
            where: {
                verificatorUserId: id,
                createdAt: {
                    gte: gte.toISOString(),
                    lte: lte.toISOString(),
                }
            },
            select: {
                trashId: true,
            }
        });

        return datas.map(data => data.trashId);
    }
}

export default VerificationRepository;