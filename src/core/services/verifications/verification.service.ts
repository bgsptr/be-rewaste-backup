import { Injectable } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { IAssignVerificatorDto } from "src/application/dto/verificators/create_verificator.dto";
import { CustomConflict } from "src/core/exceptions/custom-conflict.exception";
import { NotFoundException } from "src/core/exceptions/not-found.exception";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import TrashRepository from "src/infrastructure/postgres/repositories/trash.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import VerificationRepository from "src/infrastructure/postgres/repositories/verification.repository";
import VillageRepository from "src/infrastructure/postgres/repositories/village.repository";

@Injectable()
class VerificationService {
    constructor(
        private trashRepository: TrashRepository,
        private userRepository: UsersRepository,
        private villageRepository: VillageRepository,
        private verificationRepository: VerificationRepository,
        private logger: LoggerService,
    ) {

    }

    async updateVerificatorInformation(verificatorIdDto: string, data: IAssignVerificatorDto) {
        try {
            const verificatorId = await this.userRepository.updateVerificatorAndReturnId({ userId: verificatorIdDto, ...data });
            const village = data.villageId ? await this.villageRepository.getById(data.villageId) : null;
            // if (village && village.userVerificatorId) throw new CustomConflict('village', village.id, `selected village already have verificator`);
            if (village) {
                if (village.userVerificatorId) throw new CustomConflict('village', village.id, `selected village already have verificator`);

                await this.villageRepository.update({ id: village.id, userVerificatorId: verificatorId });
            }

            return verificatorId;
        } catch (err) {
            this.logger.error(err);
            throw err;
        }
    }

    async listAllVerification(verificatorId: string) {
        try {
            const { id } = await this.villageRepository.getByUserVerificatorId(verificatorId);
            const userInfos = await this.userRepository.findAllCitizenOnlyAddressIdInVillage(id);
            const userIds = userInfos.filter(user => user.loyaltyId !== null).map(user => user.userId);
            return this.trashRepository.getTrashByBatchCitizenId(userIds);
        } catch (err) {
            this.logger.error(err);
            if (err instanceof PrismaClientKnownRequestError) throw new NotFoundException("verificator is not assigned to any village");
            throw err;
        }
    }

    // verification-history
    // async getVerificationHistory(verificatorId: string) {
    //     const verifications = await this.verificationRepository.getVerificationHistoryList(verificatorId);

    //     const totalVerified = verifications.length;
    //     const totalPointGiven = verifications.reduce((acc, verification) => {
    //         if (verification.trash.point) {
    //             return acc + verification.trash.point;
    //         }
    //     }, 0);
    //     const weightVerifiedPerTrash = verifications.map(verification => verification.trash.trashTypes.reduce((acc, trash) => acc + trash.weight, 0));
    //     const totalWeightVerified = weightVerifiedPerTrash.reduce((acc, verified) => acc + verified, 0);
    //     const verifiedWeightRate = totalWeightVerified / totalVerified;

    //     return {
    //         verificationStats: {
    //             totalVerified,
    //             totalWeightVerified,
    //             verifiedWeightRate,
    //             totalPointGiven,
    //         },
    //         verifications,
    //     }
    // }

    async getVerificationHistory(verificatorId: string) {
        const verifications = await this.verificationRepository.getVerificationHistoryList(verificatorId);

        const totalVerified = verifications.length;

        const stats = verifications.reduce(
            (acc, verification) => {
                const trashObject = verification.trash;
                const point = trashObject.point ?? 0;
                const totalWeight = trashObject.trashTypes?.reduce((sum, trash) => sum + (trash.weight ?? 0), 0) ?? 0;
                trashObject.trashTypes.map(trash => {
                    const id = trash.trashTypeId;
                    const weight = trash.weight ?? 0;

                    if (id === "1") acc.composition.organicPersentage += weight;
                    if (id === "2") acc.composition.anorganicPersentage += weight;
                    if (id === "3") acc.composition.residuPersentage += weight;
                });

                acc.totalPointGiven += point;
                acc.totalWeightVerified += totalWeight;

                return acc;
            },
            {
                totalWeightVerified: 0,
                totalPointGiven: 0,
                composition: {
                    organicPersentage: 0,
                    anorganicPersentage: 0,
                    residuPersentage: 0,
                }
            }
        );

        const verifiedWeightRate =
            totalVerified > 0 ? stats.totalWeightVerified / totalVerified : 0;

        return {
            verificationStats: {
                totalVerified,
                totalWeightVerified: stats.totalWeightVerified,
                verifiedWeightRate,
                totalPointGiven: stats.totalPointGiven,
                compositions: (() => {
                    const result: typeof stats.composition = {
                        organicPersentage: 0,
                        anorganicPersentage: 0,
                        residuPersentage: 0,
                    };

                    for (const [key, value] of Object.entries(stats.composition)) {
                        result[key] = stats.totalWeightVerified > 0 ? (value / stats.totalWeightVerified) * 100 : 0;
                    }

                    return result;
                })(),
            },
            verifications,
        };
    }

    async getVerificationDetail(verificationId: string) {
        try {
            const { id, trashId, createdAt } = await this.verificationRepository.getById(verificationId);
            const { trashTypes, point, userCitizen } = await this.trashRepository.getWithTypesById(trashId);
            const citizen = await this.userRepository.getCitizenDetailByCitizenId(userCitizen.userId);

            return {
                id,
                verifyAt: createdAt,
                trashId,
                point,
                totalWeight: trashTypes.reduce((acc, trash) => acc + trash.weight, 0),
                trashOwner: {
                    userId: citizen.userId,
                    name: citizen.fullName,
                    address: {
                        id: citizen.address?.addressId,
                        name: citizen.address?.fullAddress,
                        village: {
                            id: citizen.village?.id,
                            name: citizen.village?.villageName,
                        },
                    },
                },
                trashDetail: trashTypes.map(trash => {
                    const { trashType, ...trashRest } = trash;
                    return {
                        trashTypeName: trash.trashType.name,
                        ...trashRest,
                    }
                })
            }
        } catch (err) {
            this.logger.error(err);
            if (err instanceof PrismaClientKnownRequestError) throw new NotFoundException('verification');
            throw err;
        }
    }
}

export default VerificationService;