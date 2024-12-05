import { expect, beforeAll, afterAll, afterEach, describe, it, vi } from 'vitest';
import path from 'path';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import 'chromedriver';

let driver: WebDriver;

beforeAll(async () => {
  global.alert = vi.fn();

  process.chdir(path.join(__dirname, '../../ratethecrate'));

  // Create Chrome options for headless mode
  const chromeOptions = new ChromeOptions();
  //chromeOptions.addArguments('--headless'); // comment out to view the browser openning
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

afterEach(async () => {
  vi.clearAllMocks();
});

describe('UI Tests for React App', () => {
  it('should load the homepage and display the correct title', async () => {
    await driver.get('https://prod.d1k3s8at0zz65i.amplifyapp.com/');
    const title = await driver.getTitle();
    expect(title).to.equal('Rate the Crate'); // Replace with actual title
  });

//   it('should toggle search bars', async () => {
//     // Locate the toggle switch
//     const toggle = await driver.wait(until.elementLocated(By.css('#toggleSearchBars')), 10000);

//     // Verify the initial state (expecting name search bar to be visible)
//     let nameSearchBar = await driver.findElement(By.id('nameSearchBar'));
//     expect(await nameSearchBar.isDisplayed()).toBe(true);

//     // Toggle to regex mode
//     await driver.executeScript("arguments[0].click();", toggle);

//     // Verify regex search bar is now visible
//     let regexSearchBar = await driver.findElement(By.id('regexSearchBar'));
//     expect(await regexSearchBar.isDisplayed()).toBe(true);

//     // Toggle back to name/version mode
//     await driver.executeScript("arguments[0].click();", toggle);
    
//     // Verify name search bar is visible again
//     nameSearchBar = await driver.findElement(By.id('nameSearchBar'));
//     expect(await nameSearchBar.isDisplayed()).toBe(true);
// });

  // it('should perform search', async () => {
  //   const searchButton = await driver.findElement(By.css('.searchButton'));

  //   await searchButton.click();

  //   const resultItems = await driver.findElements(By.css('.lightBlueBox'));
  //   expect(resultItems.length).toBeGreaterThanOrEqual(0); //need to be able to handle when there are no packages 
  // });

  // it('should open upload popup and upload a package', async () => {
  //   const uploadButton = await driver.findElement(By.css('.uploadButton'));

  //   await uploadButton.click();

  //   // Verify popup is visible
  //   const popup = await driver.wait(until.elementLocated(By.css('.UploadPopUpContent')), 5000);
  //   expect(await popup.isDisplayed()).toBe(true);

  //   //Verify toggle works
  //   const toggle = await driver.wait(until.elementLocated(By.css('#content-or-url-toggle')), 10000);
  //   await driver.executeScript("arguments[0].click();", toggle);
    
  //   // Test Content Select - could add more
  //   let fileUpload = await driver.findElement(By.id('fileUpload'));
  //   expect(fileUpload).toBeDefined();

  //   // Test URL Select
  //   await driver.executeScript("arguments[0].click();", toggle);
  //   let url = await driver.findElement(By.id('url'));
  //   expect(await url.isDisplayed()).toBe(true);
  //   await url.sendKeys('https://github.com/phillips302/ECE461');

  //   // Test Submit
  //   const submitButton = await popup.findElement(By.css('.SubmitButton'));
  //   await submitButton.click();
  //   const messagepopup = await driver.wait(until.elementLocated(By.css('.PopUpContent')), 5000);
  //   expect(await messagepopup.isDisplayed()).toBe(true);

  //   // Close the popup
  //   const closeButton = await driver.findElement(By.css('.closeButton'));
  //   await closeButton.click();

  //   // Verify pop up is not visible
  //   const isPopupDisplayed = await driver.findElements(By.css('.UploadPopUpContent'));
  //   expect(isPopupDisplayed.length).toBe(0); // Expecting no popup elements to be found
  // });

  // it('should perform search for uploaded package', async () => {
  //   const searchButton = await driver.findElement(By.css('.searchButton'));

  //   let searchBox = await driver.findElement(By.id('nameSearchBar'));
  //   await searchBox.sendKeys('ECE461');

  //   await searchButton.click();

  //   // Wait for results to load
  //   await driver.wait(until.elementLocated(By.css('.lightBlueBox')), 5000);

  //   const resultItems = await driver.findElements(By.css('.lightBlueBox'));
  //   expect(resultItems.length).toBe(1); // Ensure we got results
  // });

  // it('should display package details', async () => {
  //   // Assuming the package is loaded
  //   const packageButton = await driver.wait(until.elementLocated(By.css(`button[title='Package']`)), 5000);
  //   await packageButton.click();

  //   // Wait for the popup to show
  //   const popup = await driver.wait(until.elementLocated(By.css('.PopUpContent')), 5000);
  //   expect(await popup.isDisplayed()).toBe(true);

  //   // Close the popup
  //   const closeButton = await driver.findElement(By.css('.closeButton'));
  //   await closeButton.click();

  //   // Verify pop up is not visible
  //   const isPopupDisplayed = await driver.findElements(By.css('.PopUpContent'));
  //   expect(isPopupDisplayed.length).toBe(0); // Expecting no popup elements to be found
  // });

  // it('should download package', async () => {
  //   //need to test once download is implemented
  //   // Assuming the package is loaded
  //   // const packageButton = await driver.wait(until.elementLocated(By.css(`button[title='Download']`)), 5000);
  //   // await packageButton.click();
  // });

  // it('should display package rate', async () => {
  //   // Assuming the package is loaded
  //   const rateButton = await driver.wait(until.elementLocated(By.css(`button[title='Rate']`)), 5000);
  //   await rateButton.click();

  //   // Wait for the popup to show
  //   const popup = await driver.wait(until.elementLocated(By.css('.PopUpContent')), 5000);
  //   expect(await popup.isDisplayed()).toBe(true);

  //   // Close the popup
  //   const closeButton = await driver.findElement(By.css('.closeButton'));
  //   await closeButton.click();

  //   // Verify pop up is not visible
  //   const isPopupDisplayed = await driver.findElements(By.css('.PopUpContent'));
  //   expect(isPopupDisplayed.length).toBe(0); // Expecting no popup elements to be found
  // });

  // it('should display package cost', async () => {
  //   // Assuming the package is loaded
  //   const costButton = await driver.wait(until.elementLocated(By.css(`button[title='Cost']`)), 5000);
  //   await costButton.click();

  //   // Wait for the popup to show
  //   const popup = await driver.wait(until.elementLocated(By.css('.PopUpContent')), 5000);
  //   expect(await popup.isDisplayed()).toBe(true);

  //   // Close the popup
  //   const closeButton = await driver.findElement(By.css('.closeButton'));
  //   await closeButton.click();

  //   // Verify pop up is not visible
  //   const isPopupDisplayed = await driver.findElements(By.css('.PopUpContent'));
  //   expect(isPopupDisplayed.length).toBe(0); // Expecting no popup elements to be found
  // });

  // it('should update package', async () => {
  //   // Assuming the package is loaded
  //   const packageButton = await driver.wait(until.elementLocated(By.css(`button[title='Update']`)), 5000);
  //   await packageButton.click();

  //   // Wait for the popup to show
  //   const popup = await driver.wait(until.elementLocated(By.css('.UpdatePopUpContent')), 5000);

  //   //Verify toggle works
  //   const toggle = await driver.wait(until.elementLocated(By.css('#content-or-url-toggle')), 10000);
  //   await driver.executeScript("arguments[0].click();", toggle);

  //   // Test Content Select - could add more
  //   let fileUpload = await driver.findElement(By.id('fileUpload'));
  //   expect(fileUpload).toBeDefined();

  //   // Test URL Select
  //   await driver.executeScript("arguments[0].click();", toggle);
  //   let version = await driver.findElement(By.id('version'));
  //   await version.sendKeys('1');
  //   let url = await driver.findElement(By.id('url'));
  //   expect(await url.isDisplayed()).toBe(true);
  //   await url.sendKeys('https://github.com/phillips302/ECE461');

  //   // Test Submit
  //   const submitButton = await popup.findElement(By.css('.SubmitButton'));
  //   await submitButton.click();
  //   const messagepopup = await driver.wait(until.elementLocated(By.css('.PopUpContent')), 5000);
  //   expect(await messagepopup.isDisplayed()).toBe(true);

  //   // Close the popup
  //   const closeButton = await driver.findElement(By.css('.closeButton'));
  //   await closeButton.click();

  //   // Verify pop up is not visible
  //   const isPopupDisplayed = await driver.findElements(By.css('.UpdatePopUpContent'));
  //   expect(isPopupDisplayed.length).toBe(0); // Expecting no popup elements to be found
  // });

  // it('should perform search by name and then version and then regex', async () => {
  //   const searchButton = await driver.findElement(By.css('.searchButton'));

  //   // Search by Name
  //   await searchButton.click();
  //   await driver.wait(until.elementLocated(By.css('.lightBlueBox')), 5000);
  //   let resultItems = await driver.findElements(By.css('.lightBlueBox'));
  //   expect(resultItems.length).toBe(2);

  //   // Search by Version
  //   let version = await driver.findElement(By.id('versionSearchBar'));
  //   await version.sendKeys('1.0.01');
  //   await searchButton.click();
  //   await driver.wait(until.elementLocated(By.css('.lightBlueBox')), 5000);
  //   resultItems = await driver.findElements(By.css('.lightBlueBox'));
  //   expect(resultItems.length).toBe(1);

  //   //need to implement Search by Regex
  // });

  // it('should handle delete functionality', async () => {
  //   const deleteButton = await driver.findElement(By.css('.uploadButton[title="Reset"]'));

  //   await deleteButton.click();

  //   // Confirm deletion by checking for an empty list
  //   const packageList = await driver.findElements(By.css('.lightBlueBox'));
  //   expect(packageList.length).toBe(0);
  // });

  
});

