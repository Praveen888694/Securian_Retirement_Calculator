import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect, $, browser } from '@wdio/globals'
import fs from 'fs';
import path from 'path';
import PdfReportGenerator from '../../utils/PdfReportGenerator.js';

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

async function takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
    const screenshotPath = `./screenshots/${name}_${timestamp}.png`;
    
    try {
        if (!fs.existsSync('./screenshots')) {
            fs.mkdirSync('./screenshots', { recursive: true });
        }
        
        await browser.saveScreenshot(screenshotPath);
        if (pdfGenerator) {
            await pdfGenerator.addScreenshot(name, screenshotPath);
        }
        return screenshotPath;
    } catch (error) {
        console.error(`Error capturing screenshot ${name}:`, error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        throw new Error(`Failed to capture screenshot ${name}: ${error.message}`);
    }
}

Given('I am on the Securian website', async function () {

    await browser.url(`${process.env.BASE_URL}`);
    await browser.maximizeWindow();
    const title = await browser.getTitle();
    console.log('\n=== Page Title ===');
    console.log(title);
    console.log('=================\n');
    const screenshotPath = await takeScreenshot('initial_page');
});

Then('I enter the retirement data from {string}', async function (testCase) {
    pdfGenerator = new PdfReportGenerator(testCase);
    
    try {
        const cookieButton = await $("//*[@class='onetrust-close-btn-handler onetrust-close-btn-ui banner-close-button ot-close-icon']");
        if (await cookieButton.isDisplayed() && await cookieButton.isClickable()) {
            await cookieButton.click();
            await takeScreenshot('cookie_consent');
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
    await takeScreenshot('');

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
                await takeScreenshot('age_validation_error');
                throw new Error('Validation Error: Age cannot be greater than 120');
            }
        }
    } catch (error) {
        console.error('Error during calculation:', error.message);
        await takeScreenshot('calculation_error');
        throw error;
    } finally {
        if (pdfGenerator) {
            pdfGenerator.finalize();
        }
    }
});

Then('I enter the age,saving and social security data from {string}', async function (testCase) {
    pdfGenerator = new PdfReportGenerator(testCase);
    
    try {
        const cookieButton = await $("//*[@class='onetrust-close-btn-handler onetrust-close-btn-ui banner-close-button ot-close-icon']");
        if (await cookieButton.isDisplayed() && await cookieButton.isClickable()) {
            await cookieButton.click();         
            await takeScreenshot('cookie_consent');
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
    if (!data) {
        throw new Error(`Test data not found for test case: ${testCase}`);
    }      
    await $('//*[@id="current-age"]').waitForClickable({ timeout: 5000 });
    await $('//*[@id="current-age"]').click();
    await $('//*[@id="current-age"]').setValue(data.currentAge);
    await takeScreenshot('current_age');
    console.log('Current Age:', data.currentAge);
    await $('//*[@id="retirement-age"]').setValue(data.retirementAge);
    await takeScreenshot('retirement_age');
    console.log('Retirement Age:', data.retirementAge);
}

async function savings(testCase) {
    const data = dataManager.getData(testCase);
    if (!data) {
        throw new Error(`Test data not found for test case: ${testCase}`);
    }      
    await $("//*[@id='current-income']").click();
    await $("//*[@id='current-income']").setValue(data.currentIncome);
    await takeScreenshot('current_income');
    console.log('Current Income:', data.currentIncome);
    await $('//*[@id="spouse-income"]').click();
    await $('//*[@id="spouse-income"]').setValue(data.spouseIncome);
    await takeScreenshot('spouse_income');
    console.log('Spouse Income:', data.spouseIncome);
    await $(('//*[@id="current-total-savings"]')).click();
    await $('//*[@id="current-total-savings"]').setValue(data.currentSavings);
    await takeScreenshot('current_savings');
    console.log('Current Total Savings:', data.currentSavings);
    await $('//*[@id="current-annual-savings"]').click();
    await $('//*[@id="current-annual-savings"]').setValue(data.annualSavings);
    await takeScreenshot('annual_savings');
    console.log('Current Annual Savings:', data.annualSavings);
    await $('//*[@id="savings-increase-rate"]').setValue(data.savingsIncrease);
    await takeScreenshot('savings_increase');
    console.log('Savings Increase Rate:', data.savingsIncrease);
    
}

async function socialSecurity(testCase) {
    const data = dataManager.getData(testCase);
    if (!data) {
        throw new Error(`Test data not found for test case: ${testCase}`);
    }      
    if(data.socialSecuritybenefit == 'Yes') {
        await $('//*[contains(text(),"Yes")]').click();
        await takeScreenshot('social_security_yes');
        await $('//*[contains(text(),"Married")]').click();
        await takeScreenshot('marital_status');
        await $('//*[@id="social-security-override"]').click();
        await $('//*[@id="social-security-override"]').setValue(data.socialSecurityAmount);
        await takeScreenshot('social_security_amount');
        console.log('Social Security Amount:', data.socialSecurityAmount);
    } else {
        await $('//*[contains(text(),"No")]').click();
        await takeScreenshot('social_security_no');
        console.log('Social Security Benefit:', data.socialSecuritybenefit);
    }
}

async function adjustDefaultValues(testCase) {
    const data = dataManager.getData(testCase);
    if (!data) {
        throw new Error(`Test data not found for test case: ${testCase}`);
    }     
    await $('//*[contains(text(),"Adjust default values")]').click();
    await takeScreenshot('default_values_open');
    await $('//*[@id="additional-income"]').click();
    await $('//*[@id="additional-income"]').setValue(data.additionalIncome);
    await takeScreenshot('additional_income');
    console.log('Additional Income:', data.additionalIncome);
    await $('//*[@id="retirement-duration"]').setValue(data.retirementDuration);
    await takeScreenshot('retirement_duration');
    console.log('Retirement Duration:', data.retirementDuration);
    if(data.postRetirementIncomeIncreasewithInflation == 'Yes') {
        await $("(//*[contains(text(),'Yes')])[2]").click();
        await takeScreenshot('inflation_yes');
        await $("//*[@data-inputmask-alias='inflationPercentage']").click();
        await $("//*[@data-inputmask-alias='inflationPercentage']").setValue(data.inflationRate);
        await takeScreenshot('inflation_rate');
        console.log('Expected Inflation Rate:', data.inflationRate);
    } else {
        await $("(//*[contains(text(),'No')])[2]").click();
    }   
    await takeScreenshot('post_retirement_income_increase');
    console.log('Post Retirement Income Increase with Inflation:', data.postRetirementIncomeIncreasewithInflation);
    await $('//*[@id="retirement-annual-income"]').click();
    await $('//*[@id="retirement-annual-income"]').setValue(data.retirementIncome);
    await takeScreenshot('retirement_income');
    console.log('Retirement Annual Income:', data.retirementIncome);
    await $('//*[@id="pre-retirement-roi"]').setValue(data.preRetirementRoi);
    await takeScreenshot('pre_retirement_roi');
    console.log('Pre-Retirement ROI:', data.preRetirementRoi);
    await $('//*[@id="post-retirement-roi"]').setValue(data.postRetirementRoi);
    await takeScreenshot('post_retirement_roi');
    console.log('Post-Retirement ROI:', data.postRetirementRoi);
    await $('//*[contains(text(),"Save changes")]').waitForDisplayed({ timeout: 5000 });
    await $('//*[contains(text(),"Save changes")]').click();
    await takeScreenshot('changes_saved');
}