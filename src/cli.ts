#!/usr/bin/env node

import yargs from 'yargs';
import { Options } from './types';
import { printMainHeading, report } from './reporters/cli-reporter';
import runServiceDiscovery from '.';
import LoggerService from './services/logger';

async function run() {
  const loggerService = LoggerService.getInstance();

  try {
    const argv = yargs(process.argv.slice(2)).options({
      verbose: {
        description: 'Whether to show debug information in the cli',
        type: 'boolean',
        default: false,
        alias: 'v',
      },
      force: {
        description: 'By-pass the cache',
        type: 'boolean',
        default: false,
        alias: 'f',
      },
      'force-github-auth': {
        description: 'Force GitHub authentication',
        type: 'boolean',
        default: false,
        alias: 'g',
      },
      'log-file': {
        description: 'Specifies the log file location',
        type: 'string',
        default: 'vf-core-service-discovery.log',
        alias: 'l',
      },
      // TODO: add reset config
    }).argv;

    const options: Options = {
      forceRun: argv.force,
      forceGitHubAuth: argv['force-github-auth'],
      logFile: argv['log-file'],
    };
    const loggingLevel = argv.verbose ? 'debug' : 'info';

    loggerService.registerLogger(loggingLevel, options.logFile);

    printMainHeading();

    const discoveryOutput = await runServiceDiscovery(options);

    report(discoveryOutput);
  } catch (error) {
    const logger = loggerService.getLogger();

    logger.error(error.message);
  }
}

run();
