export interface Service<Model> {
    execute(...args: any[]): Promise<Model>
}