
import { readFile, writeFile } from 'fs';

interface IMapPayload {
  upgraded: string[];
  needsUpgrade: string[];
}

const modules = new Map<string, IMapPayload>();

readFile('progress.txt', 'utf8', (err, data) => {
  if (err) {
    throw err;
  }

  const lines = data.split('\n');

  lines.forEach((l: string) => {
    const parts = l.split(':');

    if (parts.length === 2) {

      const [path, status] = parts;

      const statusParts = status.split('-');
      const [str, module, bool] = statusParts;
      const fileName = path.split('/').pop() as string;
      let upgraded = false;
      if (bool === 'true') {
        upgraded = true;
      }

      if (!modules.has(module)) {
        const initPayload: IMapPayload = {
          upgraded: [],
          needsUpgrade: []
        };

        if (upgraded) {
          initPayload.upgraded.push(fileName);
        } else {
          initPayload.needsUpgrade.push(fileName);
        }
        modules.set(module, initPayload);
      } else {
        const m = modules.get(module) as IMapPayload;
        if (upgraded) {
          m.upgraded.push(fileName);
        } else {
          m.needsUpgrade.push(fileName);
        }
      }

    }
  });

  const markDownStr = getMdTemplate(modules);
  writeFile('progress.md', markDownStr, (err) => {
    if (err) throw err;
  });
});


function getMdTemplate(modules:  Map<string, { upgraded: string[], needsUpgrade: string[] }>): string {
  return `
  # Upgrade Progress
  ### ${getAllStats(modules)}
  ${renderModuleList(modules)} 
  `;
}

function renderModuleList(modules: Map<string, { upgraded: string[], needsUpgrade: string[] }>): string {
  let str = '';

  for (const m of modules) {
    const { upgraded, needsUpgrade } = m[1];
    const name = m[0];
    const moduleStatus = upgraded.length > 0 && needsUpgrade.length === 0 ? ':white_check_mark:' : ':heavy_check_mark:';

    str += `### ${name} - ${moduleStatus}\n`;

    str += `Completed: ${upgraded.length},
    Needs Upgrade: ${needsUpgrade.length},
    total: ${upgraded.length + needsUpgrade.length}\n`;

    if (upgraded.length > 0) {
      str += `\nCompleted:\n`;
      for (const completed of upgraded) {
        str += `* ${completed}\n`;
      }
    }

    if (needsUpgrade.length > 0) {
      str += '\nNeeds Upgrade:\n';
      for (const needsWork of needsUpgrade) {
        str += `* ${needsWork}\n`;
      }
    }
  }

  return str;
}

function getAllStats(modules: Map<string, { upgraded: string[], needsUpgrade: string[] }>) {
  let totalUpgraded = 0;
  let totalNeedsUpgrade = 0;

  for (const m of modules) {
    const { upgraded, needsUpgrade } = m[1];
    totalUpgraded += upgraded.length;
    totalNeedsUpgrade += needsUpgrade.length;
  }

  let percentComplete = Math.floor((totalUpgraded / totalNeedsUpgrade) * 100);

  return `Upgraded Files: ${totalUpgraded}, Needs Upgrade: ${totalNeedsUpgrade} ${percentComplete}% complete`;
}

