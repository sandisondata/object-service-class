import { CreateData, BaseService, Query, Row, UpdateData } from 'base-service-class';
export { Query };
export type PrimaryKey = {
    repository_uuid: string;
    is_latest: boolean;
    object_number?: number;
};
export declare abstract class ObjectService<Data extends Record<string, any>, System extends Record<string, any> = Record<string, never>> extends BaseService<PrimaryKey, Data, System> {
    readonly name: string;
    readonly tableName: string;
    readonly dataColumnNames: string[];
    readonly systemColumnNames: string[];
    constructor(name: string, tableName: string, dataColumnNames: string[], systemColumnNames?: string[]);
    create(query: Query, createData: CreateData<PrimaryKey, Data>, userUUID?: string): Promise<Row<PrimaryKey, Data, System>>;
    update(query: Query, primaryKey: Required<PrimaryKey>, updateData: UpdateData<Data>, userUUID?: string): Promise<Row<PrimaryKey, Data, System>>;
    delete(query: Query, primaryKey: Required<PrimaryKey>): Promise<void>;
    private _findRepository;
    private _checkIsLatest;
    private _findObjectNumber;
}
