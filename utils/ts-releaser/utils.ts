
const { exec, spawn } = require('child_process');
const { readFile } =  require('fs');
const { resolve } = require('path');
const chalk = require('chalk');
const clog = console.log;
const inquirer = require('inquirer');

export const prompt = inquirer.prompt;
export const clientDir = resolve('../../');

function timestamp(type: string, args: string[]) {
  return [new Date().toLocaleTimeString(), type, ...args];
}

export function initialGreeting(currentVersion: string): void {
  const statement = chalk`{bgRgb(220, 96, 38) {black.bold  Welcome to the Narrasys Releaser }}`;
  clog(statement);
  inform(`Current version: ${currentVersion}`);
}

export function inform(...args: string[]): void {
  const statement = timestamp('Note:', args).join(' ');
  clog(chalk`{blue ${statement}}`);
}

export function warn(...args: string[]): void {
  const statement = timestamp('ERROR:', args).join(' ');
  clog(chalk`{red.bold ${statement}}`);
}

export function pReadFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    readFile(path, 'utf8', (err: any, data: any) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}

export function pSpawn(cmd: string, args: string[]): Promise<any> {
  const childProcess = spawn(cmd, args, { cwd: clientDir });
  childProcess.stdout.on('data', (data: string) => {
    console.log(data.toString());
  });
  childProcess.stderr.on('data', (data: string) => {
    console.log(data.toString());
  });
  return new Promise((resolve, reject) => {
    childProcess.on('error', (data: string) => reject(data));
    childProcess.on('close', (code: any) => resolve(code));
  });
}

export function runCmd(...args: any[]): Promise<any> {
  const lastIndex = args.length - 1;
  const larg = args[lastIndex];
  let logOutput = false;

  if (typeof larg === 'boolean') {
    logOutput = larg;
    args.splice(lastIndex);
  }

  return new Promise((resolve, reject) => {
    const cb = (err: any, stdout: string, stderr: string) => {
      if (stderr) {
        console.log(stderr);
      }

      if (logOutput && stdout) {
        console.log(stdout);
      }

      if (err) {
        return reject(err);
      }

      return resolve(stdout);
    };

    args.push(cb);
    exec.apply(exec, args);
  });
}
