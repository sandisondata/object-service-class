import {
  CreateData,
  BaseService,
  Query,
  Row,
  UpdateData,
} from 'base-service-class';
import { findByPrimaryKey } from 'database-helpers';
import { Debug, MessageType } from 'node-debug';
import { BadRequestError } from 'node-errors';
// import { Row as Repository, service as repositoryService } from 'repository-service';

export { Query };

export type PrimaryKey = {
  repository_uuid: string;
  is_latest: boolean;
  object_number?: number;
};

const primaryKeyColumns = ['repository_uuid', 'is_latest', 'object_number'];

export abstract class ObjectService<
  Data extends Record<string, any>,
  System extends Record<string, any> = Record<string, never>,
> extends BaseService<PrimaryKey, Data, System> {
  constructor(
    readonly name: string,
    readonly tableName: string,
    readonly dataColumnNames: string[],
    readonly systemColumnNames: string[] = [],
  ) {
    super(
      name,
      tableName,
      primaryKeyColumns,
      dataColumnNames,
      systemColumnNames,
    );
  }

  async create(
    query: Query,
    createData: CreateData<PrimaryKey, Data>,
    userUUID?: string,
  ): Promise<Row<PrimaryKey, Data, System>> {
    const debug = new Debug(`${this.name}.create(object)`);
    debug.write(
      MessageType.Entry,
      `createData=${JSON.stringify(createData)}` +
        (typeof userUUID != 'undefined' ? `;userUUID=${userUUID}` : ''),
    );
    debug.write(MessageType.Step, 'Finding repository (for update)...');
    /*
    const repository = await this._findRepository(
      query,
      createData.repository_uuid,
    );
    */
    debug.write(MessageType.Step, 'Checking is latest...');
    this._checkIsLatest(createData.is_latest);
    debug.write(MessageType.Step, 'Finding next object number...');
    const { next_object_number } = (await findByPrimaryKey(
      query,
      '_next_object_numbers',
      {
        repository_uuid: createData.repository_uuid,
      },
      { columnNames: ['next_object_number'] },
    )) as { next_object_number: number };
    createData.object_number = next_object_number;
    debug.write(MessageType.Step, 'Calling create(base)...');
    const row = await super.create(query, createData, userUUID);
    debug.write(MessageType.Exit, `row=${JSON.stringify(row)}`);
    return row;
  }

  async update(
    query: Query,
    primaryKey: Required<PrimaryKey>,
    updateData: UpdateData<Data>,
    userUUID?: string,
  ): Promise<Row<PrimaryKey, Data, System>> {
    const debug = new Debug(`${this.name}.update(object)`);
    debug.write(
      MessageType.Entry,
      `primaryKey=${JSON.stringify(primaryKey)}` +
        `updateData=${JSON.stringify(updateData)}` +
        (typeof userUUID != 'undefined' ? `;userUUID=${userUUID}` : ''),
    );
    debug.write(MessageType.Step, 'Finding repository (for update)...');
    /*
    const repository = await this._findRepository(
      query,
      primaryKey.repository_uuid,
    );
    */
    debug.write(MessageType.Step, 'Checking is latest...');
    this._checkIsLatest(primaryKey.is_latest);
    debug.write(MessageType.Step, 'Finding object number...');
    await this._findObjectNumber(
      query,
      primaryKey.repository_uuid,
      primaryKey.object_number,
    );
    debug.write(MessageType.Step, 'Calling update(base)...');
    const row = await super.update(query, primaryKey, updateData, userUUID);
    debug.write(MessageType.Exit, `row=${JSON.stringify(row)}`);
    return row;
  }

  async delete(query: Query, primaryKey: Required<PrimaryKey>): Promise<void> {
    const debug = new Debug(`${this.name}.delete(object)`);
    debug.write(MessageType.Entry, `primaryKey=${JSON.stringify(primaryKey)}`);
    debug.write(MessageType.Step, 'Finding repository (for update)...');
    /*
    const repository = await this._findRepository(
      query,
      primaryKey.repository_uuid,
    );
    */
    debug.write(MessageType.Step, 'Checking is latest...');
    this._checkIsLatest(primaryKey.is_latest);
    debug.write(MessageType.Step, 'Finding object number...');
    await this._findObjectNumber(
      query,
      primaryKey.repository_uuid,
      primaryKey.object_number,
    );
    debug.write(MessageType.Step, 'Calling delete(base)...');
    await super.delete(query, primaryKey);
    debug.write(MessageType.Exit);
  }

  private async _findRepository(query: Query, repository_uuid: string) {
    return await findByPrimaryKey(
      query,
      'repositories', // repositoryService.tableName
      { uuid: repository_uuid },
      {
        forUpdate: true,
      },
    ); // as Repository;
  }

  private _checkIsLatest(is_latest: boolean) {
    if (!is_latest) {
      throw new BadRequestError('is_latest must be true');
    }
  }

  private async _findObjectNumber(
    query: Query,
    repository_uuid: string,
    object_number: number,
  ) {
    await findByPrimaryKey(query, '_object_numbers', {
      repository_uuid: repository_uuid,
      object_number: object_number,
    });
  }
}
