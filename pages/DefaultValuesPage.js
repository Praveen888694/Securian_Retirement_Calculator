import { $ } from '@wdio/globals';

class DefaultValuesPage {
    get adjustDefaultValuesButton() { return $('//*[contains(text(),"Adjust default values")]'); }
    get additionalIncomeInput() { return $('//*[@id="additional-income"]'); }
    get retirementDurationInput() { return $('//*[@id="retirement-duration"]'); }
    get inflationYesButton() { return $('(//*[contains(text(),"Yes")])[2]'); }
    get inflationNoButton() { return $('(//*[contains(text(),"No")])[2]'); }
    get inflationRateInput() { return $("//*[@data-inputmask-alias='inflationPercentage']"); }
    get retirementAnnualIncomeInput() { return $('//*[@id="retirement-annual-income"]'); }
    get preRetirementRoiInput() { return $('//*[@id="pre-retirement-roi"]'); }
    get postRetirementRoiInput() { return $('//*[@id="post-retirement-roi"]'); }
    get saveChangesButton() { return $('//*[contains(text(),"Save changes")]'); }

    async setDefaultValues(data) {
        await this.adjustDefaultValuesButton.click();
        await this.additionalIncomeInput.waitForClickable({ timeout: 5000 });
        await this.additionalIncomeInput.click();
        await this.additionalIncomeInput.setValue(data.additionalIncome);
        await this.retirementDurationInput.waitForClickable({ timeout: 5000 });

        await this.retirementDurationInput.setValue(data.retirementDuration);

        if(data.postRetirementIncomeIncreasewithInflation === 'Yes') {
            await this.inflationYesButton.click();
            await this.inflationRateInput.click();
            await this.inflationRateInput.waitForClickable({ timeout: 5000 });
            await this.inflationRateInput.setValue(data.inflationRate);
        } else {
            await this.inflationNoButton.click();
        }

        await this.retirementAnnualIncomeInput.click();
        await this.retirementAnnualIncomeInput.waitForClickable({ timeout: 5000 });
        await this.retirementAnnualIncomeInput.setValue(data.retirementIncome);
        await this.preRetirementRoiInput.waitForClickable({ timeout: 5000 });
        await this.preRetirementRoiInput.click();
        await this.preRetirementRoiInput.setValue(data.preRetirementRoi);
        await this.postRetirementRoiInput.waitForClickable({ timeout: 5000 });
        await this.postRetirementRoiInput.click();
        await this.postRetirementRoiInput.setValue(data.postRetirementRoi);
        await this.saveChangesButton.waitForDisplayed({ timeout: 5000 });
        await this.saveChangesButton.click();
    }
}

export default new DefaultValuesPage();
