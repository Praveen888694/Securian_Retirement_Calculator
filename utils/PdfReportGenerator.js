import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class PdfReportGenerator {
    constructor(testCase) {
        this.testCase = testCase;
        this.timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
        this.pdfPath = `./test-reports/retirement_calculator_${testCase}_${this.timestamp}.pdf`;
        this.screenshotCount = 0;
        this.initializePdf();
    }

    initializePdf() {
        if (!fs.existsSync('./test-reports')) {
            fs.mkdirSync('./test-reports', { recursive: true });
        }

        this.pdfDoc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: `Test Report - ${this.testCase}`,
                Author: 'Automation Test'
            }
        });

        this.pdfDoc.pipe(fs.createWriteStream(this.pdfPath));
        
        
        this.pdfDoc.fontSize(24).text('Retirement Calculator Test Report', { align: 'center' });
        this.pdfDoc.moveDown();
        this.pdfDoc.fontSize(16).text(`Test Case: ${this.testCase}`, { align: 'center' });
        this.pdfDoc.fontSize(12).text(`Execution Date: ${new Date().toLocaleString()}`, { align: 'center' });
    }

    async addScreenshot(name, imagePath) {
        try {
            this.pdfDoc.addPage();
            this.screenshotCount++;
            
            
            this.pdfDoc.fontSize(16).text(`Step ${this.screenshotCount}: ${name}`, { align: 'center' });
            this.pdfDoc.moveDown();

           
            this.pdfDoc.image(imagePath, {
                fit: [500, 700],
                align: 'center'
            });

       
            this.pdfDoc.fontSize(10).text(new Date().toLocaleString(), { align: 'right' });
        } catch (error) {
            console.error(`Error adding screenshot to PDF: ${error.message}`);
        }
    }

    finalize() {
        this.pdfDoc.end();
        console.log(`PDF report generated: ${this.pdfPath}`);
    }
}

export default PdfReportGenerator;
