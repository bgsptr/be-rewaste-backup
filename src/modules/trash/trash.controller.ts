import { Controller, Get, Param } from "@nestjs/common";
import TrashService from "src/core/services/trash/trash.service";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";

@Controller("trash")
class TrashController {
    constructor(
        private trashService: TrashService,
        private logger: LoggerService,
    ) { }

    @Get()
    async getAllHistoryTrashOfUser(@FetchJWTPayload() payload: { id: string }) {
        // bisa pagination filter by per month;
        const items = await this.trashService.getTrashHistories(payload.id);

        return {
            success: true,
            message: "successfully fetch all trash histories",
            result: items.map(item => ({
                id: item.id,
                pickupStatus: item.pickupStatus,
                createdAt: item.createdAt,
                point: item.point,
                trashTypes: item.trashTypes.map(tType => ({
                    weight: tType.weight,
                    trashTypeId: tType.trashTypeId,
                    name: tType.trashType.name,
                }))
            }))
        }
    }

    @Get(":id")
    async getTrashByIdController(@Param() param: { id: string }, @FetchJWTPayload() payload: { id: string }) {
        this.logger.log(`GET /trash/${param.id}`);
        const data = await this.trashService.getTrashById(param.id, payload.id);
        return {
            success: true,
            message: `trash with id: ${param.id} fetched successfully`,
            data,
        }
    }
}

export default TrashController;