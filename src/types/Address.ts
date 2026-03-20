export interface AddressAttributes {
  userId?: string | null;
  street: string;
  number: number;
  complement?: string | null;
  neighborhood: string;
  city: string;
  zip: string;
  acronym: string;
  country: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AddressCreationAttributes = Omit<
  AddressAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export type AddressUpdateAttributes = Partial<
  Omit<AddressAttributes, 'id' | 'createdAt' | 'updatedAt'>
>;
