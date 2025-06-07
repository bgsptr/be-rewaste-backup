export abstract class Repository<TEntity> {
    abstract create(data: TEntity): Promise<any>;
    abstract updateById?(id: number | string, data: TEntity): Promise<any | void>;
    abstract deleteById?(id: number | string): Promise<void>;
}