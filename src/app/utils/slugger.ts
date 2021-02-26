import * as slugger from 'slugger';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Slugger {
  public slug(name: string): string {
    return slugger(name);
  }
}
