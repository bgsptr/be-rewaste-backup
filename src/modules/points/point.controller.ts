import { Controller, Get } from "@nestjs/common";
import PointService from "src/core/services/points/point.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";

@Controller("points")
class PointController {
    constructor(
        private pointService: PointService,
    ) {}

    @Get("/overview")
    async getPointOverviewController(@FetchJWTPayload() payload: { id: string }) {
        const data = await this.pointService.getOverview(payload.id);
        return {
            success: true,
            message: "successfully fetched data",
            data,
        };
    }
}

export default PointController;