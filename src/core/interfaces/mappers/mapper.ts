export interface IMapper<DTO, Entity, ResponseDTO> {
  toEntity(dto: DTO, ...args: any): Entity | Partial<Entity>;
  toResponse?(entity: Entity): ResponseDTO;
}
