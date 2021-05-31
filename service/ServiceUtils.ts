import { ModelAttributes, ModelStatic } from "sequelize/types";
import { Contact } from "../db-models/ContactModel";
import {
  ILead,
  ILeadMetaData,
} from "../types/Models";

export function getLeadModel(extractedContact: ILeadMetaData): ILead {
  return {
    leaduid: extractedContact.filename,
    sender: extractedContact.senderId,
    source: extractedContact.source,
    link: extractedContact.blobfilename,
    rawdata: extractedContact.debug,
    originTimestamp: extractedContact.timestamp * 1000,
  };
}

export function onlyUnique(value: string, index: number, self: string[]) {
  return self.indexOf(value) === index;
}
