import { describe, it, expect } from 'vitest';
import { calculateDependencyScore, DependencyResponse } from '../src/fracDependencies.js';

const mockDependency1: DependencyResponse[] = [{ 
    ["testPack1"]: '4.0.0',
    ["testPack2"]: '*4.2.0',
    ["testPack3"]: '~1.0.0',
    ["testPack4"]: '^3.3.3',
    ["testPack5"]: '6.5.2',
    ["testPack6"]: '6.0.0',
    ["testPack7"]: '6.7.8',
    ["testPack8"]: '^6.8.12',
    ["testPack9"]: '*3.5.1',
    ["testPack10"]: '^2.0.6',
}];
const mockDependency2: DependencyResponse[] = [{ 
}];
const mockDependency3: DependencyResponse[] = [{ 
    ["testPack1"]: '1.7.7',
    ["testPack2"]: '4.0.0',
}];


describe('Dependency Fraction Test', () => {
    it('Fraction should be 1 when there are no dependencies', () => {

        const fracDependency1 = calculateDependencyScore(mockDependency2);
        expect(fracDependency1).toBe(1); // Expected fraction to 1 if no dependecies are provided
    });

    it('Fraction should be 0.7 when testing mockDependency1', () => {

        const fracDependency2 = calculateDependencyScore(mockDependency1);
        expect(fracDependency2).toBe(0.7); // Expected fraction to 1 if no dependecies are provided
    });

    it('Fraction should be 0.5 when testing mockDependency3', () => {

        const fracDependency3 = calculateDependencyScore(mockDependency3);
        expect(fracDependency3).toBe(0.5); // Expected fraction to 1 if no dependecies are provided
    });
});