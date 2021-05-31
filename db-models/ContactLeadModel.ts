import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { Contact } from "./ContactModel";
import { Lead } from "./LeadModel";

@Table
export class ContactLead extends Model {
  @ForeignKey(() => Contact)
  @Column
  contactuid: string;

  @ForeignKey(() => Lead)
  @Column
  leaduid: string;
}
