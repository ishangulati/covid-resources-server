const { Op } = require("sequelize");
import { isArray } from "util";
import { Contact } from "../db-models/ContactModel";
import { Lead } from "../db-models/LeadModel";
import { Type } from "../types/Enums";
import {
  ExtractedContact,
  IExtractedArrays,
  IListingContact,
} from "../types/Models";
import sequelize from "./SequelizeDb";
import { getLeadModel } from "./ServiceUtils";

interface IFilter extends IExtractedArrays {
  count?: number;
  offset?: string;
  type?: Type[];
}

/**
 * Add a new resource contact to the list
 *
 *
 * secretKey String
 * body ListingContact Extracted contact that needs to be added to the listing
 * returns ListingContact
 **/
export async function addContact(
  secretKey: string,
  body: IListingContact
): Promise<Contact> {
  if (secretKey === "password") {
    return Contact.create(body);
  } else {
    return Promise.reject("Invalid secret key!");
  }
}

/**
 * Add a new resource contact to the list using automated flow
 *
 *
 * secretKey String
 * body ExtractedContact Extracted contact that needs to be added to the listing
 * returns ListingContact
 **/
export function addExtractedContact(
  secretKey: string,
  body: ExtractedContact
): Promise<Contact[]> {
  return new Promise((resolve, reject) => {
    try {
      if (secretKey === "password") {
        const linkedContacts: Contact[] = [];
        const leadData = getLeadModel(body);
        const addTransaction = sequelize
          .transaction(async function (t) {
            const {
              source,
              senderId,
              link,
              filename,
              timestamp,
              debug,
              contact,
              ...createAttributes
            } = body;

            const [dbLead, leadCreated] = await Lead.findOrCreate({
              transaction: t,
              where: { leaduid: filename },
              defaults: leadData,
            });

            if (!leadCreated) {
              dbLead.update(leadData, { transaction: t });
            }

            for (const phoneNumber of contact) {
              const [dbContact, contactCreated] = await Contact.findOrCreate({
                where: {
                  contactuid: phoneNumber,
                },
                transaction: t,
                defaults: {
                  ...createAttributes,
                  contactuid: phoneNumber,
                  lastShared: dbLead.originTimestamp,
                },
              });
              if (!contactCreated) {
                dbContact.name = createAttributes.name || dbContact.name;
                //!! UPDATING TYPE
                dbContact.type = createAttributes.type;
                dbContact.verified =
                  createAttributes.verified || dbContact.verified;
                dbContact.location = dbContact.location.concat(
                  createAttributes.location || []
                );
                dbContact.medicine = dbContact.medicine.concat(
                  createAttributes.medicine || []
                );
                dbContact.food = dbContact.food.concat(
                  createAttributes.food || []
                );
                dbContact.oxygen = dbContact.oxygen.concat(
                  createAttributes.oxygen || []
                );
                dbContact.ambulance = dbContact.ambulance.concat(
                  createAttributes.ambulance || []
                );
                dbContact.therapy = dbContact.therapy.concat(
                  createAttributes.therapy || []
                );
                dbContact.bed = dbContact.bed.concat(
                  createAttributes.bed || []
                );
                dbContact.bloodgroup = dbContact.bloodgroup.concat(
                  createAttributes.bloodgroup || []
                );
                dbContact.vaccine = dbContact.vaccine.concat(
                  createAttributes.vaccine || []
                );
                //update freshness, handling null case
                if (!(dbContact.lastShared > dbLead.originTimestamp)) {
                  dbContact.lastShared = dbLead.originTimestamp;
                }
                dbContact.save({ transaction: t });
              }
              await dbContact.$add("leads", [dbLead], { transaction: t });
              linkedContacts.push(dbContact);
            }
          })
          .then(() => resolve(linkedContacts))
          .catch((e) => reject(e));
      } else {
        reject("Invalid secret key!");
      }
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Finds Resource Contacts by Type
 * Multiple resouce values can be provided with comma separated strings
 *
 * type List If looking for availability or requirement of resources (optional)
 * medicine List Medicines (optional)
 * oxygen List Oxygen Supply Type (optional)
 * beds List Beds (optional)
 * therapy List Therapy or Treatment (optional)
 * food List Meal type (optional)
 * ambulance List Ambulance (optional)
 * returns List
 **/
export async function findContactsByResource(
  filterBody: IFilter
): Promise<{ rows: Contact[]; count: number }> {
  const count = filterBody.count ? Math.min(filterBody.count, 100) : 10;
  const offset: number = +(filterBody.offset || 0);
  const { medicine, oxygen, bed, therapy, food, ambulance, bloodgroup, vaccine } =
    filterBody;
  try {
    const where = {};
    addToFilterObject("type", filterBody.type, where);
    addToFilterObject("medicines", medicine, where);
    addToFilterObject("oxygensupplies", oxygen, where);
    addToFilterObject("beds", bed, where);
    addToFilterObject("therapies", therapy, where);
    addToFilterObject("foods", food, where);
    addToFilterObject("ambulances", ambulance, where);
    addToFilterObject("bloodgroups", bloodgroup, where);
    addToFilterObject("vaccines", vaccine, where);

    return Contact.findAndCountAll({
      where,
      limit: count,
      offset,
      order: [["lastShared", "DESC"]],
      include: Lead,
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * Find resouce details by contactuid
 * Returns a resource information
 *
 * contactuid String Contact number of resource to return
 * returns ListingContact
 **/
export function getResourceByContact(
  contactuid: string
): Promise<Contact | null> {
  try {
    return Contact.findByPk(contactuid, {
      include: Lead,
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
  } catch (e) {
    return Promise.reject(e);
  }
}

function addToFilterObject(
  fieldName: string,
  fieldValue: string[] | undefined,
  filterObj: any
) {
  if (fieldValue) {
    if (isArray(fieldValue)) {
      filterObj[fieldName] = {
        [Op.or]: fieldValue.map((r) => ({ [Op.substring]: r })),
      };
    } else {
      filterObj[fieldName] = {
        [Op.substring]: fieldValue,
      };
    }
  }
}
