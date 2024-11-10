import { expect, beforeAll, afterAll, afterEach, describe, it, vi } from 'vitest';
import path from 'path';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import 'chromedriver';

let driver: WebDriver;

beforeAll(async () => {
  global.alert = vi.fn();

  process.chdir(path.join(__dirname, '../../ratethecrate'));

  driver = await new Builder().forBrowser('chrome').build();
});

afterAll(async () => {
  await driver.quit();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('UI Tests for React App', () => {

  it('should load the homepage and display the correct title', async () => {
    await driver.get('http://localhost:3000');
    const title = await driver.getTitle();
    expect(title).to.equal('Rate the Crate'); // Replace with actual title
  });

  // Test 2: Simulate a button click (e.g., Search) and check for the resulting change
  it('should click the Search button and show the correct search value', async () => {
    await driver.get('http://localhost:3000'); // Ensure we're on the homepage

    // Locate the search input and button
    const searchInput = await driver.wait(until.elementLocated(By.css('.searchBar')), 10000);
    const searchButton = await driver.wait(until.elementLocated(By.css('[title="Search"]')), 10000);

    // Type into the search input
    await searchInput.sendKeys('Lodash');
    
    // Click the Search button
    await searchButton.click();

    // Wait for the search button to apply the "sunk" class (for sinking effect)
    const searchButtonElement = await driver.wait(until.elementLocated(By.css('[title="Search"]')), 10000);
    expect(await searchButtonElement.getAttribute('class')).toContain('sunk');
  });

  // Test 3: Simulate clicking the Download button and check the alert message
  it('should click the Download button and show the correct alert message', async () => {
    await driver.get('http://localhost:3000'); // Ensure we're on the homepage

    // Locate the Download button for the first package (assumed CSS selector)
    const downloadButton = await driver.wait(until.elementLocated(By.css('[title="Download"]')), 10000);
    
    // Simulate clicking the Download button
    await downloadButton.click();
    
    // Wait for the alert and check the message (mocked alert)
    await driver.wait(until.alertIsPresent(), 10000);
    const alertText = await driver.switchTo().alert().getText();
    
    // Verify that the correct alert was triggered
    expect(alertText).toBe('Download Button clicked!');
    
    // Close the alert
    await driver.switchTo().alert().accept();
  });

  // Test 4: Simulate clicking the Upload button and verify it sinks
  it('should click the Upload button and trigger sinking effect', async () => {
    await driver.get('http://localhost:3000'); // Ensure we're on the homepage

    // Locate the Upload button
    const uploadButton = await driver.wait(until.elementLocated(By.css('[title="Upload"]')), 10000);

    // Click the Upload button
    await uploadButton.click();
    
    // Wait for the button to apply the "sunk" class (sinking effect)
    const uploadButtonElement = await driver.wait(until.elementLocated(By.css('[title="Upload"]')), 10000);
    expect(await uploadButtonElement.getAttribute('class')).toContain('sunk');
  });

});

