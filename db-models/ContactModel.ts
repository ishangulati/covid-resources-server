import {
  Table,
  Column,
  Model,
  AllowNull,
  DataType,
  BelongsToMany,
} from "sequelize-typescript";
import { onlyUnique } from "../service/ServiceUtils";
import { Type } from "../types/Enums";
import { IListingContact, IInternalListingContact } from "../types/Models";
import { ContactLead } from "./ContactLeadModel";
import { Lead } from "./LeadModel";

interface IListingContactModel extends IInternalListingContact {
  locations: string | null;
  medicines: string | null;
  foods: string | null;
  ambulances: string | null;
  oxygensupplies: string | null;
  beds: string | null;
  therapies: string | null;
  bloodgroups: string | null;
}

@Table
export class Contact extends Model<IListingContactModel, IListingContact> {
  @Column({ primaryKey: true })
  contactuid: string;

  @AllowNull(false)
  @Column
  type: Type;

  @Column
  name: string;

  @Column
  verified: string;

  @Column({ type: DataType.DATE })
  lastShared: number;

  verifiedviaportalinfo?: string;
  tags?: string;

  @BelongsToMany(() => Lead, () => ContactLead)
  leads: Lead[];

  @Column
  locations: string;

  @Column({ type: DataType.VIRTUAL })
  get location(): string[] {
    return getter(this, "locations");
  }
  set location(value: string[]) {
    setter(this, "locations", value);
  }

  @Column
  bloodgroups: string;

  @Column({ type: DataType.VIRTUAL })
  get bloodgroup(): string[] {
    return getter(this, "bloodgroups");
  }
  set bloodgroup(value: string[]) {
    setter(this, "bloodgroups", value);
  }

  @Column
  medicines: string;

  @Column({ type: DataType.VIRTUAL })
  get medicine(): string[] {
    return getter(this, "medicines");
  }
  set medicine(value: string[]) {
    setter(this, "medicines", value);
  }

  @Column
  foods: string;

  @Column({ type: DataType.VIRTUAL })
  get food(): string[] {
    return getter(this, "foods");
  }
  set food(value: string[]) {
    setter(this, "foods", value);
  }

  @Column
  ambulances: string;

  @Column({ type: DataType.VIRTUAL })
  get ambulance(): string[] {
    return getter(this, "ambulances");
  }
  set ambulance(value: string[]) {
    setter(this, "ambulances", value);
  }

  @Column
  oxygensupplies: string;

  @Column({ type: DataType.VIRTUAL })
  get oxygen(): string[] {
    return getter(this, "oxygensupplies");
  }
  set oxygen(value: string[]) {
    setter(this, "oxygensupplies", value);
  }

  @Column
  beds: string;

  @Column({ type: DataType.VIRTUAL })
  get bed(): string[] {
    return getter(this, "beds");
  }
  set bed(value: string[]) {
    setter(this, "beds", value);
  }

  @Column
  therapies: string;

  @Column({ type: DataType.VIRTUAL })
  get therapy(): string[] {
    return getter(this, "therapies");
  }
  set therapy(value: string[]) {
    setter(this, "therapies", value);
  }
}

function getter<T extends Model>(model: T, columnName: string): string[] {
  const value = model.getDataValue(columnName);
  if (value) {
    return value.split(";");
  }
  return [];
}

function setter<T extends Model>(
  model: T,
  columnName: string,
  value: string[] | null
) {
  if (value) {
    model.setDataValue(
      columnName,
      value
        .map((city) => city.toUpperCase())
        .filter(onlyUnique)
        .sort()
        .join(";")
    );
  } else {
    model.setDataValue(columnName, null);
  }
}
