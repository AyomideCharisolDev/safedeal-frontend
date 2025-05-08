// dexieDB.ts
import Dexie, { Table } from 'dexie';

export interface Product {
  id?: string;
  // Add other fields based on your product structure
  title: string;
  price: number;
  // ... etc
}

class secureDeal extends Dexie {
  cached_data!: Table<any[], string>;

  constructor() {
    super('secureDeal');
    this.version(1).stores({
        cached_data: '' // No index needed for key-value
    });
  }
}

export const db = new secureDeal();
