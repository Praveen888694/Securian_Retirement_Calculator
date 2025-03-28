import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect, $, browser } from '@wdio/globals'
import fs from 'fs';
import path from 'path';
import PdfReportGenerator from '../../utils/PdfReportGenerator.js';
import { takeScreenshot } from '../../utils/screenshotUtils.js';
import InsuredAgePage from '../../pages/InsuredAgePage.js';
import SavingsPage from '../../pages/SavingsPage.js';
import SocialSecurityPage from '../../pages/SocialSecurityPage.js';
import DefaultValuesPage from '../../pages/DefaultValuesPage.js';

const testData = JSON.parse(fs.readFileSync(new URL('../testData/retirementData.json', import.meta.url)));
let pdfGenerator;

class TestDataManager {
    constructor(testData) {
        this.testData = testData;
    }

    getData(testCase) {
        const data = this.testData[testCase];
        if (!data) {
            throw new Error(`Test data not found for test case: ${testCase}`);
        }
        return data;
    }
}

const dataManager = new TestDataManager(testData);

Given('I am on the Securian website', async function () {
    await browser.url(`${process.env.BASE_URL}`);
    await browser.maximizeWindow();
    const title = await browser.getTitle();
    console.log('\n=== Page Title ===');
    console.log(title);
    console.log('=================\n');
    const screenshotPath = await takeScreenshot('initial_page', pdfGenerator);
});

Then('I enter the retirement data from {string}', async function (testCase) {
    pdfGenerator = new PdfReportGenerator(testCase);
    
    try {
        const cookieButton = await $("//*[@class='onetrust-close-btn-handler onetrust-close-btn-ui banner-close-button ot-close-icon']");
        if (await cookieButton.isDisplayed() && await cookieButton.isClickable()) {
            await cookieButton.click();
            await takeScreenshot('cookie_consent', pdfGenerator);
        }
    } catch (error) {
        console.log('Cookie consent button not found or not clickable, continuing...');
    }

    await age(testCase);
    await savings(testCase);
    await socialSecurity(testCase);
    await adjustDefaultValues(testCase);
});

Then('I click on the Calculate button', async function () {
    const calculateButton = await $('//*[contains(text(),"Calculate")]');
    await calculateButton.waitForClickable({
        timeout: 10000,
        timeoutMsg: 'Calculate button not clickable after 10 seconds'
    });
    await calculateButton.click();
    await browser.pause(5000);
    await takeScreenshot('', pdfGenerator);

    try {     
        await browser.waitUntil(async () => {
            try {
                const resultsContainer = await $('#calculator-results-container');
                const ageError1 = await $("(//*[contains(text(),'Age cannot be greater than 120')])[1]");
                const ageError2 = await $("(//*[contains(text(),'Age cannot be greater than 120')])[2]");
                
                return (await resultsContainer.isDisplayed()) || 
                       (await ageError1.isDisplayed()) || 
                       (await ageError2.isDisplayed());
            } catch (error) {
                return false;
            }
        }, {
            timeout: 15000,
            interval: 500,
            timeoutMsg: 'Neither results container nor error message appeared after 15 seconds'
        });

        const resultsContainer = await $('#calculator-results-container');
        const isResultsVisible = await resultsContainer.isDisplayed();

        if (isResultsVisible) {
            await resultsContainer.waitForDisplayed({ timeout: 10000 });
            console.log('Complete results page captured successfully');
        } else {
            const ageError1 = await $("(//*[contains(text(),'Age cannot be greater than 120')])[1]");
            const ageError2 = await $("(//*[contains(text(),'Age cannot be greater than 120')])[2]");
            
            if (await ageError1.isExisting() || await ageError2.isExisting()) {
                
                await $("//*[@for='retirement-age']").click();
                await takeScreenshot('age_validation_error', pdfGenerator);
                throw new Error('Validation Error: Age cannot be greater than 120');
            }
        }
    } catch (error) {
        console.error('Error during calculation:', error.message);
        if (pdfGenerator) {
            await pdfGenerator.addScreenshot('calculation_error', screenshotPath);
        }
        throw error;
    } finally {
        if (pdfGenerator) {
            try {
                await pdfGenerator.finalize();
                // Wait for file system
                await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (error) {
                console.error('PDF finalization error:', error);
            }
        }
    }
});

Then('I enter the age,saving and social security data from {string}', async function (testCase) {
    pdfGenerator = new PdfReportGenerator(testCase);
    
    try {
        const cookieButton = await $("//*[@class='onetrust-close-btn-handler onetrust-close-btn-ui banner-close-button ot-close-icon']");
        if (await cookieButton.isDisplayed() && await cookieButton.isClickable()) {
            await cookieButton.click();         
            await takeScreenshot('cookie_consent', pdfGenerator);
        }
    } catch (error) {
        console.log('Cookie consent button not found or not clickable, continuing...');
    }

    await age(testCase);
    await savings(testCase);
    await socialSecurity(testCase);
});

async function age(testCase) {
    const data = dataManager.getData(testCase);
    await InsuredAgePage.setAgeDetails(data.currentAge, data.retirementAge);
    await takeScreenshot('age_details', pdfGenerator);
    console.log('Current Age:', data.currentAge);
    console.log('Retirement Age:', data.retirementAge);
}

async function savings(testCase) {
    const data = dataManager.getData(testCase);
    await SavingsPage.setSavingsDetails(data);
    await takeScreenshot('savings_details', pdfGenerator);
    console.log('Current Income:', data.currentIncome);
    console.log('Spouse Income:', data.spouseIncome);
    console.log('Annual Savings:', data.annualSavings);
    console.log('Current Savings:', data.currentSavings);
    console.log('Savings Increase Rate:', data.savingsIncrease);
    console.log('Savings details set successfully');
}

async function socialSecurity(testCase) {
    const data = dataManager.getData(testCase);
    await SocialSecurityPage.setSocialSecurityDetails(data);
    await takeScreenshot('social_security_details', pdfGenerator);
    console.log('Social Security Benefit:', data.socialSecuritybenefit);
    console.log('Social Security Amount:', data.socialSecurityAmount);
    console.log('Social Security details set successfully');
}

async function adjustDefaultValues(testCase) {
    const data = dataManager.getData(testCase);
    await DefaultValuesPage.setDefaultValues(data);
    await takeScreenshot('default_values', pdfGenerator);
    console.log('additionalIncome:', data.additionalIncome);
    console.log('retirementDuration:', data.retirementDuration);
    console.log('postRetirementIncomeIncreasewithInflation:', data.postRetirementIncomeIncreasewithInflation);
    console.log('inflationRate:', data.inflationRate);
    console.log('retirementIncome:', data.retirementIncome);
    console.log('preRetirementRoi:', data.preRetirementRoi);
    console.log('postRetirementRoi:', data.postRetirementRoi);
    console.log('Default values adjusted successfully');
}

Then('I enter the age details from {string}', async function (testCase) {
    pdfGenerator = new PdfReportGenerator(testCase);
    try {
        const cookieButton = await $("//*[@class='onetrust-close-btn-handler onetrust-close-btn-ui banner-close-button ot-close-icon']");
        if (await cookieButton.isDisplayed() && await cookieButton.isClickable()) {
            await cookieButton.click();         
            await takeScreenshot('cookie_consent', pdfGenerator);
        }
    } catch (error) {
        console.log('Cookie consent button not found or not clickable, continuing...');
    } 
    await age(testCase);
});

Then('I enter the saving details from {string}', async function (testCase) {
    await savings(testCase);
});

Then('I enter the social security details from {string}', async function (testCase) {
    await socialSecurity(testCase);
});

Then('I adjust the default values from {string}', async function (testCase) {
    await adjustDefaultValues(testCase);
});

When('I submit the retirementcalculator form', async function () {   
    const calculateButton = await $('//*[contains(text(),"Calculate")]');
    await calculateButton.waitForClickable({
        timeout: 10000,
        timeoutMsg: 'Calculate button not clickable after 10 seconds'
    });
    await calculateButton.click();
    await browser.pause(5000);
    await takeScreenshot('form_submission', pdfGenerator);
});

Then('I should see the response with the amount of retirement savings', async function () {

    try {
        const resultsContainer = await $("(//*[contains(text(),'Results')])[1]");
        await resultsContainer.waitForDisplayed({ 
            timeout: 10000,
            timeoutMsg: 'Results section not displayed after 10 seconds'
        });

        if (await resultsContainer.getText() === 'Results') {
            const resultMessage = await $("//*[@id='result-message']");
            await resultMessage.waitForDisplayed({ timeout: 5000 });
            
            const resultText = await resultMessage.getText();
            console.log('\n=== Retirement Savings Results ===');
            console.log(resultText);
            console.log('================================\n');
            
            await takeScreenshot('retirement_savings_result', pdfGenerator);
            expect(resultText).toBeTruthy();
        } else {
            throw new Error('Results section not found or empty');
        }
    } catch (error) {
        console.error('Error retrieving retirement savings result:', error.message);
        await takeScreenshot('retirement_savings_error', pdfGenerator);
        throw error;
    }
});

Then('I should see the response with error message {string}', async function (expectedError) {   
 
    try {
        const errorSelectors = [
            '#invalid-current-age-error',
            '#invalid-retirement-age-error'
        ];

        for (const selector of errorSelectors) {
            const errorElement = await $(selector);
            if (await errorElement.isDisplayed()) {
                const errorText = await errorElement.getText();
                console.log('\n=== Error Message ===');
                console.log(errorText);
                console.log('====================\n');
                
                await takeScreenshot('age_validation_error', pdfGenerator);
                console.log(`Expected Error: ${expectedError}`);
                expect(errorText).toBe(expectedError);
                return; // Exit after finding the error
            }
        }
        throw new Error('No error message found');
    } catch (error) {
        console.error('Error handling validation message:', error.message);
        await takeScreenshot('error_message_handling', pdfGenerator);
        console.log(`Expected Error: ${expectedError}`);
        throw error;
    }
});
