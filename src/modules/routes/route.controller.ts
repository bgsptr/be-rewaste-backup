import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { RolesGuard } from "src/core/guards/roles.guard";
import RouteService from "src/core/services/routes/route.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";
import { Roles } from "src/shared/decorators/roles.decorator";
import { roleNumber } from "src/utils/enum/role.enum";

@Controller("routes")
class RouteController {
    constructor(
        private routeService: RouteService,
    ) {}

    @Roles(roleNumber.TRANSPORTER)
    @UseGuards(RolesGuard)
    @Post()
    async createOptimizedRouteController(@Body() body: { villageId: string }, @FetchJWTPayload() payload: { id: string }) {
        await this.routeService.addRouteToSelectedVillage(body.villageId, payload.id);

        return {
            success: true,
            message: "successfully add route to driver"
        }
    }
}

export default RouteController;