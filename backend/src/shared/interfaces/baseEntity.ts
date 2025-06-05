import { Types } from "mongoose";

export interface IBaseEntity {
  _id?: Types.ObjectId; // auto generate by mongo db
  created_by?: Types.ObjectId | string; // _id of the identity or the system
  changed_by?: Types.ObjectId | string; // _id of the identity or the system
  created_on?: Date; // set date.now() when initiate
  last_modified_on?: Date; // set date.now() when modified
  is_active?: boolean; // check wether document is active or not
  is_delete?: boolean; // check wether document is deleted or not
}
