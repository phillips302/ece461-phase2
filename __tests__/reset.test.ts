// import * as fs from 'fs';
// import * as path from 'path';
// import { clearFolder } from '../src/reset';
// import { logMessage } from "../src/tools/utils";
// import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

// // Mocking file system methods
// vi.mock('fs', () => ({
//     existsSync: vi.fn(),
//     promises: {
//         readdir: vi.fn(),
//         stat: vi.fn(),
//         unlink: vi.fn(),
//         rmdir: vi.fn(),
//     },
// }));

// vi.mock('../src/tools/utils', () => ({
//     logMessage: vi.fn(),
// }));

// describe('clearFolder', () => {
//     const folderPath = './testFolder';

//     beforeEach(() => {
//         vi.clearAllMocks();
//     });

//     it('should log an error and exit if the folder does not exist', async () => {
//         (fs.existsSync as Mock).mockReturnValue(false);

//         await expect(clearFolder(folderPath, false)).rejects.toThrow();
//         expect(logMessage).toHaveBeenCalledWith("ERROR", `The folder "${folderPath}" does not exist.`);
//     });

//     it('should clear all files and subfolders in the specified folder', async () => {
//         (fs.existsSync as Mock).mockReturnValue(true);
//         (fs.promises.readdir as Mock).mockResolvedValue(['file1.txt', 'subfolder']);
//         (fs.promises.stat as Mock)
//             .mockResolvedValueOnce({ isDirectory: () => false }) // file1.txt
//             .mockResolvedValueOnce({ isDirectory: () => true }); // subfolder
//         (fs.promises.readdir as Mock).mockResolvedValueOnce([]); // subfolder is empty

//         await clearFolder(folderPath, false);

//         expect(fs.promises.unlink).toHaveBeenCalledWith(path.join(folderPath, 'file1.txt'));
//         expect(fs.promises.rmdir).toHaveBeenCalledWith(path.join(folderPath, 'subfolder'));
//         expect(logMessage).toHaveBeenCalledWith("INFO", `Deleted file: ${path.join(folderPath, 'file1.txt')}`);
//         expect(logMessage).toHaveBeenCalledWith("INFO", `Deleted folder: ${path.join(folderPath, 'subfolder')}`);
//     });

//     it('should delete the root folder if deleteRootFolder is true', async () => {
//         (fs.existsSync as Mock).mockReturnValue(true);
//         (fs.promises.readdir as Mock).mockResolvedValue([]);
        
//         await clearFolder(folderPath, true);
        
//         expect(fs.promises.rmdir).toHaveBeenCalledWith(folderPath);
//         expect(logMessage).toHaveBeenCalledWith("INFO", `Deleted folder: ${folderPath}`);
//     });

//     it('should log an error if an exception occurs during clearing', async () => {
//         (fs.existsSync as Mock).mockReturnValue(true);
//         (fs.promises.readdir as Mock).mockRejectedValue(new Error('Test error'));

//         await expect(clearFolder(folderPath, false)).rejects.toThrow();
//         expect(logMessage).toHaveBeenCalledWith("ERROR", `Error clearing folder "${folderPath}": Test error`);
//     });
// });
