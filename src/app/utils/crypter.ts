import * as Cryptr from 'cryptr';

export class Crypter {
  public static encrypt(text: string, secret: string): string {
    const cryptr = new Cryptr(secret);

    return cryptr.encrypt(text);
  }

  public static decrypt(text: string, secret: string): string {
    const cryptr = new Cryptr(secret);

    return cryptr.decrypt(text);
  }
}
