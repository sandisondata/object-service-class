"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectService = void 0;
const base_service_class_1 = require("base-service-class");
const database_helpers_1 = require("database-helpers");
const node_debug_1 = require("node-debug");
const node_errors_1 = require("node-errors");
const primaryKeyColumns = ['repository_uuid', 'is_latest', 'object_number'];
class ObjectService extends base_service_class_1.BaseService {
    constructor(name, tableName, dataColumnNames, systemColumnNames = []) {
        super(name, tableName, primaryKeyColumns, dataColumnNames, systemColumnNames);
        this.name = name;
        this.tableName = tableName;
        this.dataColumnNames = dataColumnNames;
        this.systemColumnNames = systemColumnNames;
    }
    create(query, createData, userUUID) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const debug = new node_debug_1.Debug(`${this.name}.create(object)`);
            debug.write(node_debug_1.MessageType.Entry, `createData=${JSON.stringify(createData)}` +
                (typeof userUUID != 'undefined' ? `;userUUID=${userUUID}` : ''));
            debug.write(node_debug_1.MessageType.Step, 'Finding repository (for update)...');
            /*
            const repository = await this._findRepository(
              query,
              createData.repository_uuid,
            );
            */
            debug.write(node_debug_1.MessageType.Step, 'Checking is latest...');
            this._checkIsLatest(createData.is_latest);
            debug.write(node_debug_1.MessageType.Step, 'Finding next object number...');
            const { next_object_number } = (yield (0, database_helpers_1.findByPrimaryKey)(query, '_next_object_numbers', {
                repository_uuid: createData.repository_uuid,
            }, { columnNames: ['next_object_number'] }));
            debug.write(node_debug_1.MessageType.Value, `next_object_number=${next_object_number}`);
            createData.object_number = next_object_number;
            debug.write(node_debug_1.MessageType.Step, 'Creating object number...');
            yield (0, database_helpers_1.createRow)(query, '_object_numbers', {
                repository_uuid: createData.repository_uuid,
                object_number: createData.object_number,
            });
            debug.write(node_debug_1.MessageType.Step, 'Calling create(base)...');
            const row = yield _super.create.call(this, query, createData, userUUID);
            debug.write(node_debug_1.MessageType.Exit, `row=${JSON.stringify(row)}`);
            return row;
        });
    }
    update(query, primaryKey, updateData, userUUID) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const debug = new node_debug_1.Debug(`${this.name}.update(object)`);
            debug.write(node_debug_1.MessageType.Entry, `primaryKey=${JSON.stringify(primaryKey)}` +
                `updateData=${JSON.stringify(updateData)}` +
                (typeof userUUID != 'undefined' ? `;userUUID=${userUUID}` : ''));
            debug.write(node_debug_1.MessageType.Step, 'Finding repository (for update)...');
            /*
            const repository = await this._findRepository(
              query,
              primaryKey.repository_uuid,
            );
            */
            debug.write(node_debug_1.MessageType.Step, 'Checking is latest...');
            this._checkIsLatest(primaryKey.is_latest);
            debug.write(node_debug_1.MessageType.Step, 'Finding object number...');
            yield this._findObjectNumber(query, {
                repository_uuid: primaryKey.repository_uuid,
                object_number: primaryKey.object_number,
            });
            debug.write(node_debug_1.MessageType.Step, 'Calling update(base)...');
            const row = yield _super.update.call(this, query, primaryKey, updateData, userUUID);
            debug.write(node_debug_1.MessageType.Exit, `row=${JSON.stringify(row)}`);
            return row;
        });
    }
    delete(query, primaryKey) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const debug = new node_debug_1.Debug(`${this.name}.delete(object)`);
            debug.write(node_debug_1.MessageType.Entry, `primaryKey=${JSON.stringify(primaryKey)}`);
            debug.write(node_debug_1.MessageType.Step, 'Finding repository (for update)...');
            /*
            const repository = await this._findRepository(
              query,
              primaryKey.repository_uuid,
            );
            */
            debug.write(node_debug_1.MessageType.Step, 'Checking is latest...');
            this._checkIsLatest(primaryKey.is_latest);
            debug.write(node_debug_1.MessageType.Step, 'Finding object number...');
            const objectNumber = yield this._findObjectNumber(query, {
                repository_uuid: primaryKey.repository_uuid,
                object_number: primaryKey.object_number,
            });
            debug.write(node_debug_1.MessageType.Step, 'Calling delete(base)...');
            yield _super.delete.call(this, query, primaryKey);
            debug.write(node_debug_1.MessageType.Exit);
        });
    }
    _findRepository(query, repository_uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, database_helpers_1.findByPrimaryKey)(query, 'repositories', // repositoryService.tableName
            { uuid: repository_uuid }, {
                forUpdate: true,
            }); // as Repository;
        });
    }
    _checkIsLatest(is_latest) {
        if (!is_latest) {
            throw new node_errors_1.BadRequestError('is_latest must be true');
        }
    }
    _findObjectNumber(query, primaryKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield (0, database_helpers_1.findByPrimaryKey)(query, '_object_numbers', primaryKey));
        });
    }
}
exports.ObjectService = ObjectService;
