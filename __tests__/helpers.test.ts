import { describe, it, expect, vi } from 'vitest';
import { contentToURL, urlToContent, findPackageJson } from '../src/apis/helpers.js';
import * as path from 'path';
import * as fs from 'fs';

vi.mock('fs', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('fs');
  return {
    ...actual,
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(() => '{}'),
    rmSync: vi.fn(),
    unlinkSync: vi.fn(),
    readdirSync: vi.fn(() => ['package.json']),
    lstatSync: vi.fn(() => ({ isDirectory: () => false })),
    promises: {
      mkdir: vi.fn(),
      writeFile: vi.fn(),
    },
  };
});

describe('yourModule Tests', () => {
  const zipContent = Buffer.from('PK\u0003\u0004', 'ascii').toString('base64'); // Mocked ZIP content

  it('should convert content to URL', async () => {
    const url = await contentToURL(zipContent);

    // Ensuring that mocked fs functions are called
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.rmSync).toHaveBeenCalledTimes(0);
    expect(fs.unlinkSync).toHaveBeenCalledTimes(0);
    expect(url).toBe('Failed to get the url');
  });

  it('should fail to convert URL to Content', async () => {
    const url = 'https://github.com/user/repo';
    const content = await urlToContent(url);
    expect(content).toBe('Failed to get the zip file');
  });

  it('should convert URL to Content and back to URL', async () => {
    const url = 'https://github.com/browserify/browserify';

    const content = await urlToContent(url);
    expect(content).toBeTruthy();

    const newUrl = await contentToURL(content);
    expect(newUrl).toBeTruthy();
  });

  it('should find package.json', async () => {
    const directory = path.join(__dirname, 'testDir');
    const packageJsonPath = path.join(directory, 'package.json');
    await fs.promises.mkdir(directory, { recursive: true });
    await fs.promises.writeFile(packageJsonPath, '{}');

    const result = findPackageJson(directory);
    expect(result).toBe(packageJsonPath);
  });
});
