import { Injectable, OnModuleInit } from '@nestjs/common';
import mongoose from 'mongoose';
import { WinstonLoggerService } from '../logger/winston-logger.service';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(private readonly loggers: WinstonLoggerService) {}

  onModuleInit() {
    mongoose.connection.on('error', error => {
      this.loggers.error(error.message, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', error => {
      this.loggers.error(error, 'MongoDB disconnected');
    });

    mongoose.connection.on('connected', () => {
      this.loggers.log('MongoDB is connected');
    });
  }
}
