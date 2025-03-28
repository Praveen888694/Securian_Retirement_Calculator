import { $ } from '@wdio/globals';

class SavingsPage {
    get currentIncomeInput() { return $("//*[@id='current-income']"); }
    get spouseIncomeInput() { return $('//*[@id="spouse-income"]'); }
    get currentTotalSavingsInput() { return $('//*[@id="current-total-savings"]'); }
    get currentAnnualSavingsInput() { return $('//*[@id="current-annual-savings"]'); }
    get savingsIncreaseRateInput() { return $('//*[@id="savings-increase-rate"]'); }

    async setSavingsDetails(data) {
        await this.currentIncomeInput.click();
        await this.currentIncomeInput.setValue(data.currentIncome);
        await this.spouseIncomeInput.click();
        await this.spouseIncomeInput.setValue(data.spouseIncome);
        await this.currentTotalSavingsInput.click();
        await this.currentTotalSavingsInput.setValue(data.currentSavings);
        await this.currentAnnualSavingsInput.click();
        await this.currentAnnualSavingsInput.setValue(data.annualSavings);
        await this.savingsIncreaseRateInput.setValue(data.savingsIncrease);
    }
}

export default new SavingsPage();
