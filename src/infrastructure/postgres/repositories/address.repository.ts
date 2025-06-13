import { Injectable } from "@nestjs/common";
import { Address } from "@prisma/client";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class AddressRepository {
    constructor(
        private prisma: PrismaService,
    ) { }

    async create({ addressId, fullAddress = "", lat = "", lng = "" }: Address) {
        await this.prisma.address.create({
            data: { addressId, fullAddress, lat, lng }
        });
    }

    async generateAddressId(addressId: string) {
        const { addressId: id } = await this.prisma.address.create({
            data: { addressId, fullAddress: "", lat: "", lng: "" }
        });

        return id;
    }
}

export default AddressRepository;