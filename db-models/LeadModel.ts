import {
  Table,
  Column,
  Model,
  PrimaryKey,
  BelongsToMany,
  DataType,
} from "sequelize-typescript";
import { ILead } from "../types/Models";
import { ContactLead } from "./ContactLeadModel";
import { Contact } from "./ContactModel";

@Table
export class Lead extends Model<ILead> {
  @PrimaryKey
  @Column
  leaduid: string;

  @Column
  sender: string;

  @Column
  source: string;

  @Column
  link: string;

  @Column({ type: DataType.DATE })
  originTimestamp: number;

  @Column({ type: DataType.STRING(2000) })
  rawdata: string;

  @BelongsToMany(() => Contact, () => ContactLead)
  contacts: Contact[];
}
