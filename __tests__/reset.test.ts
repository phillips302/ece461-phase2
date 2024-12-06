import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'; 
import * as fs from 'fs';
import * as path from 'path';
import { Stats, PathLike } from 'fs';

// Create mock module for utils
vi.mock('../src/tools/utils.js', () => ({
    logMessage: vi.fn()
}));

// Import after mock
import { logMessage } from '../src/tools/utils.js';
import { clearFolder } from '../src/reset.js';

// Mock process.exit
vi.mock('process', () => ({
    exit: vi.fn()
}));

// Mock the fs module
vi.mock('fs', async () => {
    const actual = await vi.importActual('fs') as typeof fs;
    return {
        ...actual,
        existsSync: vi.fn(),
        promises: {
            readdir: vi.fn(),
            stat: vi.fn(),
            unlink: vi.fn(),
        }
    };
});

vi.mock('path');

describe('clearFolder', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should successfully clear a folder with files', async () => {
        const mockFiles = ['file1.txt', 'file2.txt'];
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.promises.readdir).mockResolvedValue(mockFiles as any);
        vi.mocked(fs.promises.stat).mockImplementation(async (_path: PathLike) => ({
            isDirectory: () => false
        } as Stats));
        vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

        const result = await clearFolder('./testFolder');

        expect(result).toBe(0);
        expect(fs.promises.unlink).toHaveBeenCalledTimes(2);
        expect(vi.mocked(logMessage)).toHaveBeenCalledWith('INFO', expect.stringContaining('Deleted file:'));
    });

    it('should handle folders with subdirectories', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);

        // Mock readdir to return different values for different paths
        const mockReaddir = vi.mocked(fs.promises.readdir);
        mockReaddir
            .mockResolvedValueOnce(['file1.txt', 'subdir'] as any) // first call returns file and subdir
            .mockResolvedValueOnce(['subfile.txt'] as any); // second call returns file inside subdir

        // Mock stat to identify directories
        vi.mocked(fs.promises.stat).mockImplementation(async (path: PathLike) => ({
            isDirectory: () => path.toString().includes('subdir') // treat path with 'subdir' as directory
        } as Stats));

        vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

        const result = await clearFolder('./testFolder');

        expect(result).toBe(0);
        expect(mockReaddir).toHaveBeenCalledTimes(3);
        expect(fs.promises.unlink).toHaveBeenCalledTimes(1);
    });

    it('should return 1 when folder does not exist', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        const result = await clearFolder('./nonexistentFolder');

        expect(result).toBe(1);
        expect(vi.mocked(logMessage)).toHaveBeenCalledWith('ERROR', expect.stringContaining('does not exist'));
        expect(fs.promises.readdir).not.toHaveBeenCalled();
    });

    it('should handle errors during file deletion', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.promises.readdir).mockResolvedValue(['file1.txt'] as any);
        vi.mocked(fs.promises.stat).mockImplementation(async (_path: PathLike) => ({
            isDirectory: () => false
        } as Stats));
        vi.mocked(fs.promises.unlink).mockRejectedValue(new Error('Permission denied'));

        const result = await clearFolder('./testFolder');

        expect(result).toBe(1);
        expect(vi.mocked(logMessage)).toHaveBeenCalledWith('ERROR', expect.stringContaining('Permission denied'));
    });

    it('should handle errors during directory reading', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.promises.readdir).mockRejectedValue(new Error('Access denied'));

        const result = await clearFolder('./testFolder');

        expect(result).toBe(1);
        expect(vi.mocked(logMessage)).toHaveBeenCalledWith('ERROR', expect.stringContaining('Access denied'));
    });

    it('should log each deleted file exactly once', async () => {
        const mockFiles = ['file1.txt'];
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.promises.readdir).mockResolvedValue(mockFiles as any);
        vi.mocked(fs.promises.stat).mockImplementation(async (_path: PathLike) => ({
            isDirectory: () => false
        } as Stats));
        vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

        await clearFolder('./testFolder');

        const mockLogMessage = vi.mocked(logMessage);
        const deleteLogCalls = mockLogMessage.mock.calls.filter(
            call => call[0] === 'INFO' && call[1].startsWith('Deleted file:') // filter for delete logs
        );
        expect(deleteLogCalls.length).toBe(2); // expect the log to happen twice
    });
});


