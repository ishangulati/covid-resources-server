import { Lead } from "../db-models/LeadModel";
import { Sequelize } from "sequelize-typescript";
import { Contact } from "../db-models/ContactModel";
import { ContactLead } from "../db-models/ContactLeadModel";
import dbSettings from "../db-settings.json";

const sequelize = new Sequelize(
  dbSettings.database,
  dbSettings.username,
  dbSettings.password,
  {
    host: dbSettings.host,
    dialect: "mssql",
    models: [Lead, Contact, ContactLead],
  }
);

export default sequelize;
