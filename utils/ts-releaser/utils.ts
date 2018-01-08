
const { exec, spawn } = require('child_process');
const { readFile, writeFile } =  require('fs');
const { resolve } = require('path');
const chalk = require('chalk');
const clog = console.log;
const inquirer = require('inquirer');
const got = require('got');

export const prompt = inquirer.prompt;
export const clientDir = resolve('../../');
export const modulesProgressDir = resolve('../modules-progress');

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

export function success(...args: string[]): void {
  const statement = timestamp('Success:', args).join(' ');
  clog(chalk`{green.bold ${statement}}`);
}

export function link(...args: string[]): void {
  clog(chalk`{blue.underline ${args.join(' ')}}`);
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

export function pWriteFile(path: string, file: string): Promise<void> {
  return new Promise((resolve, reject) => {
    writeFile(path, file, 'utf8', (err: string) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

export function pSpawn(cmd: string, args: string[], path = clientDir): Promise<any> {
  const childProcess = spawn(cmd, args, { cwd: path });
  childProcess.stdout.on('data', (data: string) => {
    console.log(data.toString());
  });
  childProcess.stderr.on('data', (data: string) => {
    console.log(data.toString());
  });
  return new Promise((resolve, reject) => {
    childProcess.on('error', (data: string) => reject(data));
    childProcess.on('close', (code: any) => {
      if (code !== 0) {
        return reject(code);
      }
      return resolve(code);
    });
  });
}

export function httpRequest(url: string): Promise<string> {
  return got(url).then((response: any) => response.body);
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
    exec.apply(exec, args, { cwd: clientDir });
  });
}
