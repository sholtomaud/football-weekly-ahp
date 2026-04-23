#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function main() {
  let projectName = process.argv[2];

  if (!projectName) {
    projectName = await askQuestion(
      'What is the name of your project? (default: my-boba-app) '
    );
    if (!projectName) {
      projectName = 'my-boba-app';
    }
  }

  if (!projectName) {
    console.error('Project name is required.');
    process.exit(1);
  }

  const projectPath = path.resolve(process.cwd(), projectName);
  const templatePath = path.resolve(__dirname, '..', 'template');

  if (fs.existsSync(projectPath)) {
    console.error(`Directory ${projectName} already exists.`);
    process.exit(1);
  }

  console.log(`Creating a new Boba app in ${projectPath}...`);

  try {
    await fs.promises.mkdir(projectPath);

    const filesToCopy = await fs.promises.readdir(templatePath);

    for (const file of filesToCopy) {
      const sourcePath = path.join(templatePath, file);
      const destPath = path.join(projectPath, file);
      await fs.promises.cp(sourcePath, destPath, { recursive: true });
    }

    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJsonContent = await fs.promises.readFile(
      packageJsonPath,
      'utf-8'
    );
    const packageJson = JSON.parse(packageJsonContent);
    packageJson.name = projectName;
    // remove bin entry from the created app's package.json
    if (packageJson.bin) delete packageJson.bin;
    // remove prompts from dependencies
    if (packageJson.dependencies && packageJson.dependencies.prompts)
      delete packageJson.dependencies.prompts;
    await fs.promises.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2)
    );

    console.log('Success! Your new Boba app is ready.');
    console.log(`To get started, run the following commands:`);
    console.log(`  cd ${projectName}`);
    console.log(`  npm install`);
    console.log(`  npm start`);
  } catch (error) {
    console.error('Error creating the app:', error);
    fs.rmSync(projectPath, { recursive: true, force: true }); // Clean up the created directory on error
    process.exit(1);
  }
}

main();
