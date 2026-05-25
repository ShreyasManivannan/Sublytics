import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract';

// ---------------------------------------------------------------------------
// AWS Clients (Lazy Initialization)
// ---------------------------------------------------------------------------
let s3Client = null;
let sesClient = null;
let textractClient = null;

const getS3Client = () => {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock',
      },
    });
  }
  return s3Client;
};

const getSESClient = () => {
  if (!sesClient) {
    sesClient = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock',
      },
    });
  }
  return sesClient;
};

const getTextractClient = () => {
  if (!textractClient) {
    textractClient = new TextractClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock',
      },
    });
  }
  return textractClient;
};

// ---------------------------------------------------------------------------
// S3 Upload
// ---------------------------------------------------------------------------

/**
 * Upload subscription invoice file to AWS S3.
 * Falls back to a mock URL when credentials are not configured.
 */
export async function uploadInvoiceToS3(fileBuffer, fileName, fileMime) {
  const bucketName = process.env.AWS_S3_BUCKET || 'sublytics-invoices';
  const objectKey = `invoices/${Date.now()}_${fileName}`;
  const hasCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

  if (!hasCredentials) {
    console.log(`[S3 MOCK] Upload "${fileName}" → ${objectKey}`);
    return `https://${bucketName}.s3.amazonaws.com/${objectKey}`;
  }

  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: fileBuffer,
        ContentType: fileMime,
      }),
    );
    console.log(`[S3] Uploaded: ${objectKey}`);
    return `https://${bucketName}.s3.amazonaws.com/${objectKey}`;
  } catch (err) {
    console.error('[S3 ERROR]', err.message);
    throw new Error(`Failed to upload invoice to S3: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Email via SES
// ---------------------------------------------------------------------------

/**
 * Send an email alert via AWS SES.
 * Falls back to a mock log when credentials are not configured.
 */
export async function sendSESEmail(to, subject, html) {
  const source = process.env.AWS_SES_SOURCE_EMAIL || 'Sublytics <noreply@sublytics.app>';
  const hasCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

  if (!hasCredentials) {
    console.log(`[SES MOCK] To: ${to} | Subject: ${subject}`);
    return { mockSent: true, messageId: `mock-${Date.now()}` };
  }

  try {
    const command = new SendEmailCommand({
      Source: source,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const response = await getSESClient().send(command);
    console.log(`[SES] Email sent to ${to}: ${response.MessageId}`);
    return { success: true, messageId: response.MessageId };
  } catch (err) {
    console.error('[SES ERROR]', err.message);
    throw new Error(`Failed to send email via SES: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Invoice OCR via Textract
// ---------------------------------------------------------------------------

/**
 * Scan an invoice file and extract subscription data using AWS Textract.
 * Falls back to a smart heuristic mock parser when credentials are not configured.
 */
export async function scanInvoiceWithTextract(fileBuffer, fileName) {
  const hasCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

  if (!hasCredentials) {
    console.log(`[TEXTRACT MOCK] Scanning: ${fileName}`);
    await new Promise((r) => setTimeout(r, 800));
    return runMockTextract(fileName);
  }

  try {
    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: fileBuffer,
      },
    });

    const response = await getTextractClient().send(command);
    const lines = (response.Blocks || [])
      .filter((block) => block.BlockType === 'LINE')
      .map((block) => block.Text)
      .join('\n');

    console.log(`[TEXTRACT] Extracted ${response.Blocks.length} blocks from: ${fileName}`);
    return parseTextractResult(lines, fileName);
  } catch (err) {
    console.error('[TEXTRACT ERROR]', err.message);
    throw new Error(`Failed to scan document with Textract: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Heuristic OCR Parser & Fallback Mocks
// ---------------------------------------------------------------------------

function parseTextractResult(text, fileName) {
  const lowerText = text.toLowerCase();
  const lowerFile = fileName.toLowerCase();
  const combined = `${lowerFile}\n${lowerText}`;

  // 1. Identify Service Name
  const knownServices = [
    { name: 'Netflix', category: 'Entertainment' },
    { name: 'Spotify', category: 'Music' },
    { name: 'AWS', category: 'Cloud Storage' },
    { name: 'Amazon', category: 'Cloud Storage' },
    { name: 'Figma', category: 'Productivity' },
    { name: 'ChatGPT', category: 'Productivity' },
    { name: 'OpenAI', category: 'Productivity' },
    { name: 'GitHub', category: 'Productivity' },
    { name: 'Hulu', category: 'Entertainment' },
    { name: 'Slack', category: 'Productivity' },
    { name: 'Zoom', category: 'Utilities' },
    { name: 'YouTube', category: 'Entertainment' },
    { name: 'iCloud', category: 'Cloud Storage' },
    { name: 'Adobe', category: 'Productivity' },
  ];

  let serviceName = null;
  let category = 'Other';

  for (const service of knownServices) {
    if (combined.includes(service.name.toLowerCase())) {
      serviceName = service.name;
      category = service.category;
      break;
    }
  }

  if (!serviceName) {
    const match = lowerFile.match(/^([a-z0-9\s-_]+)/);
    if (match && match[1].trim().length > 2) {
      serviceName = match[1].trim();
      serviceName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
    } else {
      serviceName = 'Unknown Service';
    }
  }

  // 2. Identify Amount
  let amount = 9.99;
  const amountPatterns = [
    /\$\s?([\d,]+\.\d{2})/,
    /total[:\s]*\$?\s?([\d,]+\.\d{2})/i,
    /amount[:\s]*\$?\s?([\d,]+\.\d{2})/i,
    /charge[:\s]*\$?\s?([\d,]+\.\d{2})/i,
    /invoice total[:\s]*\$?\s?([\d,]+\.\d{2})/i,
    /([\d,]+\.\d{2})\s?usd/i,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  // 3. Identify Renewal Date
  let renewalDate = futureDate(30);
  const datePatterns = [
    /(?:next\s*(?:billing|renewal|payment)\s*(?:date)?|renews?\s*on|due\s*(?:date|on|by))[:\s]*(\w+\s+\d{1,2},?\s*\d{4})/i,
    /(?:next\s*(?:billing|renewal|payment)\s*(?:date)?|renews?\s*on|due\s*(?:date|on|by))[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = new Date(match[1]);
      if (!isNaN(parsed.getTime())) {
        renewalDate = parsed.toISOString().split('T')[0];
        break;
      }
    }
  }

  return {
    serviceName,
    amount,
    renewalDate,
    category,
  };
}

function runMockTextract(fileName) {
  const fn = fileName.toLowerCase();

  if (fn.includes('netflix'))               return { serviceName: 'Netflix',      amount: 15.99, renewalDate: futureDate(3),  category: 'Entertainment' };
  if (fn.includes('spotify'))               return { serviceName: 'Spotify',      amount: 9.99,  renewalDate: futureDate(12), category: 'Music' };
  if (fn.includes('aws') || fn.includes('amazon')) return { serviceName: 'AWS',   amount: 48.50, renewalDate: futureDate(5),  category: 'Cloud Storage' };
  if (fn.includes('figma'))                 return { serviceName: 'Figma',        amount: 15.00, renewalDate: futureDate(2),  category: 'Productivity' };
  if (fn.includes('chatgpt') || fn.includes('openai')) return { serviceName: 'ChatGPT Plus', amount: 20.00, renewalDate: futureDate(6), category: 'Productivity' };
  if (fn.includes('github'))               return { serviceName: 'GitHub Pro',   amount: 4.00,  renewalDate: futureDate(18), category: 'Productivity' };

  const services   = ['Adobe CC', 'Notion Pro', 'iCloud+', 'YouTube Premium', 'Zoom'];
  const categories = ['Productivity', 'Productivity', 'Cloud Storage', 'Entertainment', 'Utilities'];
  const idx = Math.floor(Math.random() * services.length);

  return {
    serviceName: services[idx],
    amount: parseFloat((Math.random() * 40 + 5).toFixed(2)),
    renewalDate: futureDate(7),
    category: categories[idx],
  };
}

function futureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
