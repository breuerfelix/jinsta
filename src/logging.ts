import winston from 'winston';
import { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const fileLogFormat = winston.format.printf(({ level, message, label, timestamp }) => {
	return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
	levels: winston.config.npm.levels,
	transports: [
		new winston.transports.Console({
			format: format.combine(winston.format.splat(), winston.format.cli()),
			level: 'info'
		}),
		new DailyRotateFile({
			format: format.combine(winston.format.splat(), winston.format.timestamp(), winston.format.padLevels(), fileLogFormat),
			level: 'debug',
			filename: 'logs/jinsta-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '7d'
		})
	]
});

export default logger;