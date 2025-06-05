import {
  FilterQuery,
  Model,
  PopulateOptions,
  QueryOptions,
  Types,
  Document,
  PipelineStage,
  AnyBulkWriteOperation,
  MongooseBulkWriteOptions,
  UpdateQuery,
  UpdateWriteOpResult,
} from "mongoose";
import { IBaseEntity } from "../interfaces/baseEntity";

export abstract class CommonDatabaseService<T extends IBaseEntity> {
  constructor(private readonly mongooseModel: Model<T & Document>) {}

  async addNewDocument(
    doc: T,
    populate: string | PopulateOptions | (string | PopulateOptions)[] = []
  ): Promise<T> {
    const newDoc = await this.mongooseModel.create({
      ...doc,
    });

    newDoc.populate(populate);
    const newDocOnDb: T = newDoc.toObject() as T;

    return newDocOnDb;
  }

  async filterDocuments(filter = {}, options = {}): Promise<T[]> {
    const docs = await this.mongooseModel
      .find(filter, {}, { lean: true, ...options })
      .sort({ created_on: "desc" })
      .exec();
    
    return docs as T[];
  }


  async findDocument(
    filter: FilterQuery<T> = {},
    options: QueryOptions<T> = {}
  ): Promise<T | null> {
    return (
      await this.mongooseModel.findOne(filter, {}, options)?.exec()
    )?.toObject() as T | null;
  }

  async findById(id: Types.ObjectId | string): Promise<T | null> {
    const doc = (await this.mongooseModel.findById(id)?.exec())?.toObject();

    if (!doc) return null;

    return doc as T;
  }
}
