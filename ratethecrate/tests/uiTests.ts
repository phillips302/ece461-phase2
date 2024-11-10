import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import { expect } from 'chai';
import 'chromedriver';

let driver: WebDriver;

before(async () => {
  driver = await new Builder().forBrowser('chrome').build();
});

after(async () => {
  await driver.quit();
});

describe('UI Tests for React App', () => {

  it('should load the homepage and display the correct title', async () => {
    await driver.get('http://localhost:3000');
    const title = await driver.getTitle();
    expect(title).to.equal('Expected Title'); // Replace with actual title
  });

  it('should click a button and display a message', async () => {
    const button = await driver.wait(until.elementLocated(By.css('.your-button-class')), 10000);
    await button.click();

    const result = await driver.wait(until.elementLocated(By.css('.result-message-class')), 10000);
    const resultText = await result.getText();
    expect(resultText).to.equal('Expected Result Message'); // Replace with expected message
  });

});
