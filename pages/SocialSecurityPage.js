import { $ } from '@wdio/globals';

class SocialSecurityPage {
    get yesButton() { return $('//*[contains(text(),"Yes")]'); }
    get noButton() { return $('//*[contains(text(),"No")]'); }
    get marriedButton() { return $('//*[contains(text(),"Married")]'); }
    get socialSecurityOverrideInput() { return $('//*[@id="social-security-override"]'); }

    async setSocialSecurityDetails(data) {
        if(data.socialSecuritybenefit === 'Yes') {
            await this.yesButton.click();
            await this.marriedButton.click();
            await this.socialSecurityOverrideInput.click();
            await this.socialSecurityOverrideInput.setValue(data.socialSecurityAmount);
        } else {
            await this.noButton.click();
        }
    }
}

export default new SocialSecurityPage();
