import { $ } from '@wdio/globals';

class InsuredAgePage {
    get currentAgeInput() { return $('//*[@id="current-age"]'); }
    get retirementAgeInput() { return $('//*[@id="retirement-age"]'); }

    async setAgeDetails(currentAge, retirementAge) {
        await this.currentAgeInput.waitForClickable({ timeout: 5000 });
        await this.currentAgeInput.click();
        await this.currentAgeInput.setValue(currentAge);
        await this.retirementAgeInput.setValue(retirementAge);
    }
}

export default new InsuredAgePage();
