import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface City {
  id: string;
  name: string;
}

class HistoryService {
  private historyFilePath = path.join(__dirname, '../../../db/db.json');

  async getCities(): Promise<City[]> {
    try {
      const raw = await fs.readFile(this.historyFilePath, 'utf-8');
      return JSON.parse(raw) as City[];
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        await fs.writeFile(this.historyFilePath, '[]', 'utf-8');
        return [];
      }
      throw err;
    }
  }

  async addCity(name: string): Promise<City> {
    const cities = await this.getCities();
    const newCity: City = { id: uuidv4(), name };
    cities.push(newCity);
    await this.write(cities);
    return newCity;
  }

  async removeCity(id: string): Promise<void> {
    const cities = await this.getCities();
    const updated = cities.filter((c) => c.id !== id);
    await this.write(updated);
  }

  private async write(cities: City[]): Promise<void> {
    await fs.writeFile(this.historyFilePath, JSON.stringify(cities, null, 2), 'utf-8');
  }
}

export default new HistoryService();
