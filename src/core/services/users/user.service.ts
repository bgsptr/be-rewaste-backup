import { CreateCitizenDto } from "src/application/dto/citizens/create_citizen.dto";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";

class UserService {
    constructor(
        private userRepository: UsersRepository,
    ) {}

    async addCitizen(data: CreateCitizenDto) {

    }
}

export default UserService;