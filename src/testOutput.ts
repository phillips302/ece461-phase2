import { exec } from 'child_process';

try {
    exec('npx vitest run --config vitest.backend.config.ts --coverage', (error, stdout, stderr) => {
        let totalTests = '0';
        let passedTests = '0';
        let coverage = '0';

        if(stderr) {
            console.log('stderr: ' + stderr);
            process.exit(1);
        }

        (stdout.split('\n')).forEach(element => {
            if (element.includes("All files")){
                let coverageArray = element.split('|');
                coverage = parseInt(coverageArray[coverageArray.length - 2]).toString().trim();
            }
        });

        stdout.split('\n').forEach(element => {
            if (element.includes("Tests")){
                const parts = element.match(/\d+/g);
                if(parts) {
                    passedTests = parts[4];
                    totalTests = parts[8];
                }
            }
        });
        process.stdout.write(stdout);
        process.stdout.write(`Total: ${totalTests}\n`);
        process.stdout.write(`Passed: ${passedTests}\n`);
        process.stdout.write(`Coverage: ${coverage}%\n`);
        process.stdout.write(`${passedTests}/${totalTests} test cases passed. ${coverage}% line coverage achieved.\n`);
        process.exit(0);
    });
} catch (error) {
    process.stderr.write(`Tests failed to run: ${error}\n`);
    process.exit(1);
}