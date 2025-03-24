import { Injectable, NestMiddleware } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class BodyParserMiddleware implements NestMiddleware {
  private jsonParser;

  constructor() {
    this.jsonParser = bodyParser.json();
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (!req.body || Object.keys(req.body).length === 0) {
      this.jsonParser(req, res, next);
    } else {
      next();
    }
  }
}
