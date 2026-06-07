import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { BillStatus } from '@prisma/client';
const PdfPrinter = require('pdfmake');

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async generatePdfReceipt(billId: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id: billId },
      include: {
        items: true,
        customer: true,
        vehicle: true,
        receipt: true,
      },
    });

    if (!bill) throw new NotFoundException('Bill not found');
    if (bill.status !== BillStatus.FINALIZED) {
      throw new Error('Only finalized bills can have receipts generated');
    }

    // Generate PDF Buffer
    const pdfBuffer = await this.createPdfBuffer(bill);

    // Upload to Storage
    const storageKey = `receipts/${bill.id}-${Date.now()}.pdf`;
    const pdfUrl = await this.storageService.uploadFile('receipts', storageKey, pdfBuffer, 'application/pdf');

    // Save Receipt Record
    if (bill.receipt) {
      return this.prisma.receipt.update({
        where: { id: bill.receipt.id },
        data: { pdfUrl, storageKey },
      });
    } else {
      return this.prisma.receipt.create({
        data: {
          billId,
          pdfUrl,
          storageKey,
        },
      });
    }
  }

  private createPdfBuffer(bill: any): Promise<Buffer> {
    const lang = bill.language || 'EN';

    // Language label maps
    const labels = {
      EN: {
        taxInvoice: 'TAX INVOICE',
        billTo: 'Bill To:',
        vehicle: 'Vehicle:',
        invoiceNo: 'Invoice #:',
        date: 'Date:',
        description: 'Description',
        qty: 'Qty',
        unitPrice: 'Unit Price',
        tax: 'Tax',
        subtotal: 'Subtotal',
        taxableAmt: 'Taxable Amount',
        cgst: 'CGST',
        sgst: 'SGST',
        grandTotal: 'Grand Total',
        na: 'N/A',
      },
      TA: {
        taxInvoice: 'வரி இன்வாய்ஸ்',
        billTo: 'பில் பெறுநர்:',
        vehicle: 'வாகனம்:',
        invoiceNo: 'இன்வாய்ஸ் #:',
        date: 'தேதி:',
        description: 'விவரம்',
        qty: 'அளவு',
        unitPrice: 'அலகு விலை',
        tax: 'வரி',
        subtotal: 'உபகொகை',
        taxableAmt: 'வரிக்கு உட்பட்ட தொகை',
        cgst: 'CGST',
        sgst: 'SGST',
        grandTotal: 'மொத்தத் தொகை',
        na: 'இல்லை',
      },
    };

    const L = lang === 'TA' ? labels.TA : labels.EN;

    return new Promise((resolve, reject) => {
      const fonts = {
        Roboto: {
          normal: 'Helvetica',
          bold: 'Helvetica-Bold',
          italics: 'Helvetica-Oblique',
          bolditalics: 'Helvetica-BoldOblique'
        }
      };

      const printer = new PdfPrinter(fonts);

      const itemsTableBody = [
        [L.description, L.qty, L.unitPrice, L.tax, L.subtotal],
        ...bill.items.map((item: any) => [
          item.description,
          Number(item.quantity).toString(),
          `₹${Number(item.unitPrice).toFixed(2)}`,
          `₹${Number(item.taxAmt).toFixed(2)}`,
          `₹${Number(item.subtotal).toFixed(2)}`
        ])
      ];

      const docDefinition = {
        defaultStyle: { font: 'Roboto' },
        content: [
          { text: L.taxInvoice, style: 'header', alignment: 'center' },
          { text: 'SRI BALAMURUGAN TANKER WELDING', style: 'subheader', alignment: 'center' },
          { text: '\n' },
          {
            columns: [
              {
                text: [
                  { text: `${L.billTo}\n`, bold: true },
                  `${bill.clientName}\n`,
                  `${L.vehicle} ${bill.vehicleNumber || L.na}\n`,
                ]
              },
              {
                text: [
                  { text: `${L.invoiceNo} `, bold: true }, `${bill.id}\n`,
                  { text: `${L.date} `, bold: true }, `${new Date(bill.billedAt).toLocaleDateString()}\n`,
                ],
                alignment: 'right'
              }
            ]
          },
          { text: '\n' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto', 'auto'],
              body: itemsTableBody
            }
          },
          { text: '\n' },
          {
            columns: [
              { text: '' },
              {
                text: [
                  `${L.taxableAmt}: ₹${Number(bill.taxableAmt).toFixed(2)}\n`,
                  `${L.cgst}: ₹${Number(bill.cgstAmt).toFixed(2)}\n`,
                  `${L.sgst}: ₹${Number(bill.sgstAmt).toFixed(2)}\n`,
                  { text: `${L.grandTotal}: ₹${Number(bill.grandTotal).toFixed(2)}\n`, bold: true, fontSize: 14 },
                ],
                alignment: 'right'
              }
            ]
          }
        ],
        styles: {
          header: { fontSize: 18, bold: true },
          subheader: { fontSize: 14, bold: true, margin: [0, 5, 0, 5] },
        }
      };

      const pdfDoc = printer.createPdfKitDocument(docDefinition as any);
      const chunks: any[] = [];
      
      pdfDoc.on('data', (chunk: any) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', (err: any) => reject(err));
      
      pdfDoc.end();
    });
  }
}

