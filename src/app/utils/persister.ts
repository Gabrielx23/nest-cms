import { Model } from 'sequelize-typescript';

export class Persister {
  public static persist(object: Object, partial: Partial<any>): any {
    for (const key in partial) {
      if (object instanceof Model) {
        object.setDataValue(key, partial[key]);
        continue;
      }

      object[key] = partial[key];
    }

    return object;
  }
}
