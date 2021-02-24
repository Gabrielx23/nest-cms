export class Persister {
  public static persist(object: Object, partial: Partial<any>): any {
    for (const key in partial) {
      object[key] = partial[key];
    }

    return object;
  }
}
