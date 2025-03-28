import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { getFormattedTimestamp } from './dateUtils.js';

class PdfReportGenerator {
    constructor(testCase = 'default') {
        this.testCase = testCase;
        const timestamp = getFormattedTimestamp();
        const sanitizedTestCase = testCase.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `retirement_calculator_${sanitizedTestCase}_${timestamp}.pdf`;
        
        const reportsDir = path.resolve('./test-reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        this.filePath = path.join(reportsDir, fileName);
        this.screenshotCount = 0;

        this.doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: `Retirement Calculator Test Report - ${testCase}`,
                Author: 'Automation Test',
                CreationDate: new Date()
            }
        });

        this.writeStream = fs.createWriteStream(this.filePath);
        this.doc.pipe(this.writeStream);
        this.addHeader();
    }

    addHeader() {
        this.doc
            .font('Helvetica-Bold')
            .fontSize(24)
            .text('Retirement Calculator Test Report', {
                align: 'center'
            })
            .moveDown()
            .fontSize(16)
            .text(`Test Case: ${this.testCase}`, {
                align: 'center'
            })
            .fontSize(12)
            .text(`Execution Date: ${new Date().toLocaleString()}`, {
                align: 'center'
            })
            .moveDown(2);
    }

    async addScreenshot(name, imagePath) {
        if (!this.doc) return;

        try {
            if (!fs.existsSync(imagePath)) {
                console.error(`Screenshot not found: ${imagePath}`);
                return;
            }

            this.screenshotCount++;
            this.doc.addPage();

            this.doc
                .fontSize(16)
                .text(`Step ${this.screenshotCount}: ${name}`, {
                    align: 'center'
                })
                .moveDown();

            this.doc.image(imagePath, {
                fit: [500, 700],
                align: 'center'
            });

        } catch (error) {
            console.error(`Screenshot error: ${error.message}`);
        }
    }

    async finalize() {
        try {
            this.doc.addPage();
            this.doc
                .fontSize(16)
                .text('Test Summary', {
                    align: 'center'
                })
                .moveDown()
                .text(`Total Screenshots: ${this.screenshotCount}`);

            this.doc.end();
            return this.filePath;
        } catch (error) {
            console.error('Error finalizing PDF:', error);
            throw error;
        }
    }
}

export default PdfReportGenerator;
