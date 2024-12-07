import { expect, beforeAll, afterAll, afterEach, describe, it, vi } from 'vitest';
import path from 'path';
import { Builder, By, until, WebDriver, WebElement, WebElementPromise } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import 'chromedriver';

let driver: WebDriver;

beforeAll(async () => {
  global.alert = vi.fn();

  process.chdir(path.join(__dirname, '../../ratethecrate'));

  // Create Chrome options for headless mode
  const chromeOptions = new ChromeOptions();
  chromeOptions.addArguments('--headless'); // comment out to view the browser openning
  chromeOptions.addArguments('--no-sandbox');
  chromeOptions.addArguments('--disable-dev-shm-usage');

  // Initialize the WebDriver with headless Chrome
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();
});

afterAll(async () => {
  await driver.quit();
});

describe('UI Tests for React App', () => {
  it('should load the homepage and display the correct title', async () => {
    await driver.get('https://prod.d1k3s8at0zz65i.amplifyapp.com/');
    const title = await driver.getTitle();
    expect(title).to.equal('Rate the Crate'); // Replace with actual title
  });

  it('should toggle search bars', async () => {
    // Locate the toggle switch
    const toggle = await driver.findElement(By.css('.switch input[type="checkbox"]'));
    // expect(await toggle.isDisplayed()).toBe(true);

    // Verify the initial state (expecting name search bar to be visible)
    let versionSearchBar = await driver.findElement(By.id('versionSearchBar'));
    expect(await versionSearchBar.isDisplayed()).toBe(true);
    
    // Toggle to regex mode
    await driver.executeScript("arguments[0].click();", toggle);

    // Verify regex search bar is now visible
    let regexSearchBar = await driver.findElement(By.id('regexSearchBar'));
    expect(await regexSearchBar.isDisplayed()).toBe(true);

    // Toggle back to name/version mode
    await driver.executeScript("arguments[0].click();", toggle);
    
    // Verify name search bar is visible again
    versionSearchBar = await driver.findElement(By.id('versionSearchBar'));
    expect(await versionSearchBar.isDisplayed()).toBe(true);
});

  it('should perform search', async () => {
    const searchButton = await driver.findElement(By.css('.searchButton'));

    await searchButton.click();

    const resultItems = await driver.findElements(By.css('.lightBlueBox'));
    expect(resultItems.length).toBeGreaterThanOrEqual(0); //need to be able to handle when there are no packages 
  });

  it('should open upload popup and upload a package', async () => {
    const uploadButton = await driver.findElement(By.css('.uploadButton'));

    await uploadButton.click();

    // Verify popup is visible
    const popup = await driver.wait(until.elementLocated(By.css('.UploadPopUpContent')), 5000);
    expect(await popup.isDisplayed()).toBe(true);

    //Verify toggle works
    const toggles = await driver.findElements(By.css('.switch input[type="checkbox"]'));
    await driver.executeScript("arguments[0].click();", toggles[1]);
    
    // Test Content Select - could add more
    let fileUpload = await driver.findElement(By.id('fileUpload'));
    expect(fileUpload).toBeDefined();

    // Test URL Select
    await driver.executeScript("arguments[0].click();", toggles[1]);
    let url = await driver.findElement(By.id('url'));
    expect(await url.isDisplayed()).toBe(true);
    await url.sendKeys('https://github.com/lquixada/cross-fetch');

    // Test Submit
    const submitButton = await popup.findElement(By.css('.SubmitButton'));
    await submitButton.click();
    const messagepopup = await driver.wait(until.elementLocated(By.css('.PopUpContent')), 5000);
    expect(await messagepopup.isDisplayed()).toBe(true);

    // Close the popup
    const closeButton = await driver.findElement(By.css('.closeButton'));
    await closeButton.click();

    // Verify pop up is not visible
    const isPopupDisplayed = await driver.findElements(By.css('.UploadPopUpContent'));
    expect(isPopupDisplayed.length).toBe(0); // Expecting no popup elements to be found
  });

  it('should perform search for uploaded package', async () => {
    const searchButton = await driver.findElement(By.css('.searchButton'));

    let searchBox = await driver.findElement(By.id('nameSearchBar'));
    await searchBox.sendKeys('cross-fetch');
    
    await searchButton.click()
    await driver.sleep(100)

    // Wait for results to load
    await driver.wait(until.elementLocated(By.css('.lightBlueBox')), 5000);

    const resultItems = await driver.findElements(By.css('.lightBlueBox'));
    expect(resultItems.length).toBeGreaterThanOrEqual(1); // Ensure we got results
  });

  it('should display package details', async () => {
    // Assuming the package is loaded
    const packageButton = await driver.findElement(By.css(`button[title='Package']`));
    await driver.executeScript("arguments[0].click();", packageButton);

    // Wait for the popup to show
    const popup = await driver.wait(until.elementLocated(By.css('.PopUpContent')), 5000);
    expect(await popup.isDisplayed()).toBe(true);

    // Close the popup
    const closeButton = await driver.findElement(By.css('.closeButton'));
    await closeButton.click();

    // Verify pop up is not visible
    const isPopupDisplayed = await driver.findElements(By.css('.PopUpContent'));
    expect(isPopupDisplayed.length).toBe(0); // Expecting no popup elements to be found
  });

  it('should download package', async () => {
    // Assuming the package is loaded
    const packageButton = await driver.wait(until.elementLocated(By.css(`button[title='Download']`)), 5000);
    await packageButton.click();

    const popup = await driver.wait(until.elementLocated(By.css('.PopUpContent')), 5000);
    expect(await popup.isDisplayed()).toBe(true);

    // Close the popup
    const closeButton = await driver.findElement(By.css('.closeButton'));
    await closeButton.click();

    // Verify pop up is not visible
    const isPopupDisplayed = await driver.findElements(By.css('.PopUpContent'));
    expect(isPopupDisplayed.length).toBe(0); // Expecting no popup elements to be found
  });

  it('should display package rate', async () => {
    // Assuming the package is loaded
    const rateButton = await driver.wait(until.elementLocated(By.css(`button[title='Rate']`)), 5000);
    await rateButton.click();

    // Wait for the popup to show
    const popup = await driver.wait(until.elementLocated(By.css('.PopUpContent')), 5000);
    expect(await popup.isDisplayed()).toBe(true);

    // Close the popup
    const closeButton = await driver.findElement(By.css('.closeButton'));
    await closeButton.click();

    // Verify pop up is not visible
    const isPopupDisplayed = await driver.findElements(By.css('.PopUpContent'));
    expect(isPopupDisplayed.length).toBe(0); // Expecting no popup elements to be found
  });

  it('should display package cost', async () => {
    // Assuming the package is loaded
    const costButton = await driver.wait(until.elementLocated(By.css(`button[title='Cost']`)), 5000);
    await costButton.click();

    // Wait for the popup to show
    const popup = await driver.wait(until.elementLocated(By.css('.PopUpContent')), 5000);
    expect(await popup.isDisplayed()).toBe(true);

    // Close the popup
    const closeButton = await driver.findElement(By.css('.closeButton'));
    await closeButton.click();

    // Verify pop up is not visible
    const isPopupDisplayed = await driver.findElements(By.css('.PopUpContent'));
    expect(isPopupDisplayed.length).toBe(0); // Expecting no popup elements to be found
  });

  it('should update package', async () => {
    // Assuming the package is loaded
    const packageButton = await driver.wait(until.elementLocated(By.css(`button[title='Update']`)), 5000);
    await packageButton.click();

    // Wait for the popup to show
    const popup = await driver.wait(until.elementLocated(By.css('.UpdatePopUpContent')), 5000);

    //Verify toggle works
    const toggles = await driver.findElements(By.css('.switch input[type="checkbox"]'));
    await driver.executeScript("arguments[0].click();", toggles[1]);

    // Test Content Select - could add more
    let fileUpload = await driver.findElement(By.css('#fileUpload'));
    expect(fileUpload).toBeDefined();

    // Test URL Select
    await driver.executeScript("arguments[0].click();", toggles[1]);
    let version = await driver.findElements(By.id('version'));
    expect(version).toBeDefined();
    let url = await driver.findElement(By.id('url'));
    expect(await url.isDisplayed()).toBe(true);
    await driver.sleep(100)
    await url.sendKeys('https://github.com/lquixada/cross-fetch');
    await version[0].clear()
    await version[0].sendKeys('1.1.1.1.1');

    // Test Submit
    const submitButton = await popup.findElement(By.css('.SubmitButton'));
    await submitButton.click();
    const messagepopup = await driver.wait(until.elementLocated(By.css('.PopUpContent')), 5000);
    expect(await messagepopup.isDisplayed()).toBe(true);

    // Close the popup
    const closeButton = await driver.findElement(By.css('.closeButton'));
    await closeButton.click();

    // Verify pop up is not visible
    const isPopupDisplayed = await driver.findElements(By.css('.UpdatePopUpContent'));
    expect(isPopupDisplayed.length).toBe(0); // Expecting no popup elements to be found
  });

  it('should perform search by name and then version and then regex', async () => {
    const searchButton = await driver.findElement(By.css('.searchButton'));

    // Search by Name
    await searchButton.click();
    await driver.sleep(100)
    await driver.wait(until.elementLocated(By.css('.lightBlueBox')), 5000);
    let resultItems = await driver.findElements(By.css('.lightBlueBox'));
    expect(resultItems.length).toBeGreaterThanOrEqual(2);

    // Search by Version
    let version = await driver.findElement(By.id('versionSearchBar'));
    await version.sendKeys('1.1.1.1.1');
    await searchButton.click();
    await driver.sleep(100)
    resultItems = await driver.findElements(By.css('.lightBlueBox'));
    expect(resultItems.length).toBeGreaterThanOrEqual(1);

    // Search by Regex
    const toggle = await driver.findElement(By.css('.switch input[type="checkbox"]'));
    await driver.executeScript("arguments[0].click();", toggle);
    let regexSearchBar = await driver.findElement(By.id('regexSearchBar'));
    expect(await regexSearchBar.isDisplayed()).toBe(true);

    await regexSearchBar.sendKeys(".?cross.")
    await searchButton.click();
    await driver.sleep(100)

    resultItems = await driver.findElements(By.css('.lightBlueBox'));
    expect(resultItems.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle delete functionality', async () => {
    const deleteButton = await driver.findElement(By.css('.uploadButton[title="Reset"]'));
  
    await deleteButton.click();
    await driver.sleep(100);

    const submitButton = await driver.findElements(By.css('.DeleteButtons'));
    await submitButton[0].click();
    await driver.sleep(100);

    const closeButton = await driver.findElement(By.css('.closeButton'));
    await closeButton.click();

    const packageList = await driver.findElements(By.css('.lightBlueBox'));
    expect(packageList.length).toBe(0); // Check that the list is empty
  });
});

