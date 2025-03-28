import fs from 'fs';
import path from 'path';
import { browser } from '@wdio/globals';

export async function takeScreenshot(name, pdfGenerator = null) {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
    const screenshotDir = path.resolve('./screenshots');
    
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const screenshotPath = path.join(screenshotDir, `${name}_${timestamp}.png`);
    
    try {
        await browser.saveScreenshot(screenshotPath);
        await new Promise((resolve) => setTimeout(resolve, 500)); 
        
        if (pdfGenerator) {
            await pdfGenerator.addScreenshot(name, screenshotPath);
        }
        
        return screenshotPath;
    } catch (error) {
        console.error(`Error capturing screenshot ${name}:`, error.message);
        throw error;
    }
}
