const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PdfPrinter = require("pdfmake");
const fs = require("fs");
const path = require("path");
const NodeCache = require("node-cache");
const cheerio = require("cheerio");

// Initialize configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize cache with 30 min TTL
const contractCache = new NodeCache({ stdTTL: 1800 });

// Configure middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir));

// Initialize Google Generative AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set in .env file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Font configuration for PDFMake
const fonts = {
  Roboto: {
    normal: path.join(__dirname, 'fonts', 'Roboto-Regular.ttf'),
    bold: path.join(__dirname, 'fonts', 'Roboto-Medium.ttf'),
    italics: path.join(__dirname, 'fonts', 'Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, 'fonts', 'Roboto-MediumItalic.ttf')
  }
};

// Create PDF printer instance
const printer = new PdfPrinter(fonts);

/**
 * Improved contract prompts for better AI response
 */
const CONTRACT_PROMPTS = {
  "Offer Letter": (fields) => {
    return `Generate a professional Employment Offer Letter:

CONTEXT:
- Output: Plain text only (no HTML)
- Document Style: Formal business letter
- Purpose: Extend job offer with clear terms

DATA:
Employer: ${fields.companyName}${fields.companyAddress ? ` | ${fields.companyAddress}` : ""}
Candidate: ${fields.recipientName}
Position: ${fields.position}
${fields.location ? `Location: ${fields.location}` : ""}
Start Date: ${fields.startDate}
${fields.duration ? `Term: ${fields.duration}` : ""}
${fields.workingDays ? `Working Days: ${fields.workingDays}` : ""}
Hours: ${fields.workingHours}
Compensation: ${fields.compensation}
${fields.benefits ? `Benefits: ${fields.benefits}` : ""}
${fields.additionalTerms ? `Additional Terms: ${fields.additionalTerms}` : ""}

DOCUMENT STRUCTURE:
1. Company Letterhead (placeholder: [LOGO_IMAGE])
2. Current Date
3. Candidate's Name and Address
4. Subject Line: "Offer of Employment: ${fields.position}"
5. Welcoming Introduction
6. Position Details: Title, Department, Reporting Structure
7. Start Date and Location
8. Compensation Package
9. Benefits Summary
10. Working Hours and Conditions
11. Employment Terms (At-will status, probation, etc.)
12. Acceptance Instructions
13. Closing
14. Signature Block (placeholder: [SIGNATURE_IMAGE])

FORMAT REQUIREMENTS:
- Use professional business letter format
- Keep tone warm yet professional
- Clear paragraph breaks between sections
- Include signature line for company representative

This letter should make the candidate feel valued while clearly communicating all terms of employment.`;
  },

  "Job Contract": (fields) => {
    return `Generate a comprehensive Employment Contract:

CONTEXT:
- Output: Plain text only (no HTML)
- Document Style: Formal legal agreement
- Purpose: Define employment relationship and terms

DATA:
Employer: ${fields.companyName}${fields.companyAddress ? ` | ${fields.companyAddress}` : ""}
Employee: ${fields.recipientName}
Position: ${fields.position}
${fields.location ? `Location: ${fields.location}` : ""}
Start Date: ${fields.startDate}
${fields.duration ? `Term: ${fields.duration}` : ""}
${fields.workingDays ? `Working Days: ${fields.workingDays}` : ""}
Hours: ${fields.workingHours}
Compensation: ${fields.compensation}
${fields.benefits ? `Benefits: ${fields.benefits}` : ""}
${fields.additionalTerms ? `Additional Terms: ${fields.additionalTerms}` : ""}

DOCUMENT STRUCTURE:
1. Title: "EMPLOYMENT CONTRACT"
2. Parties: Employer and employee identification
3. Position & Duties: Job title, responsibilities, reporting structure
4. Term: Employment start date, probationary period if applicable
5. Compensation: Salary/wages, payment schedule, bonus structure
6. Benefits: Insurance, retirement, time off policies
7. Work Schedule: Hours, location, flexibility
8. Confidentiality: Protection of company information
9. Intellectual Property: Ownership of work product
10. Non-Compete/Non-Solicitation (if applicable)
11. Termination Conditions: Notice periods, severance
12. Governing Law
13. Dispute Resolution
14. Signatures

FORMAT REQUIREMENTS:
- Clear section headings
- Numbered or bulleted clauses for clarity
- Professional legal language but plain enough for non-lawyers
- Signature blocks for both employer and employee

This contract should protect the employer's interests while being fair and transparent to the employee.`;
  },

  "Rental Contract": (fields) => {
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const location = fields.propertyAddress ? fields.propertyAddress.split(',').pop().trim() : "";
    
    return `
Generate a legally binding Residential Lease Agreement using the following fields:

- Landlord Name: ${fields.ownerName}
- Landlord Address: ${fields.ownerAddress}
- Tenant Name: ${fields.recipientName}
- Property Address: ${fields.propertyAddress}
- Lease Start Date: ${fields.startDate}
- Lease Duration: ${fields.duration} (e.g., "12 months")
- Monthly Rent: ${fields.rentAmount}
- Security Deposit: ${fields.securityDeposit}
- Tenant Utilities Responsibility: ${fields.utilities}
- Jurisdiction State: ${fields.state}

The agreement must include:

1. **Parties** – Identify both Landlord and Tenant, including full legal names and address.
2. **Leased Premises** – Clearly specify the rental property address and its use as a private residence.
3. **Lease Term** – Define the start date, duration, and automatic conversion to month-to-month unless terminated with 30 days’ written notice.
4. **Rent** – Specify rent amount, due date (1st of each month), grace period (until the 5th), late fee (5%), and payment method (electronic transfer).
5. **Security Deposit** – State the deposit amount, its purpose, and return conditions (within 30 days, minus damages beyond normal wear and tear).
6. **Utilities & Maintenance** – List tenant's utility responsibilities, landlord's repair duties, and tenant’s obligation to maintain cleanliness and report issues.
7. **Access Rights** – Allow landlord access with 24 hours' notice for inspection, repairs, or showings. Emergency access permitted without notice.
8. **Tenant Obligations** – Include clauses about no illegal activity, no subletting without consent, no structural changes, and maintaining renter's insurance.
9. **Termination Terms** – Cover early termination (60-day notice), return of premises condition, and landlord rights to terminate for violations.
10. **Legal Provisions** – Include governing law (based on provided state), entire agreement clause, notice requirements, and severability.

Include signature blocks for:
- Landlord
- Tenant
- Optional Witness

Ensure professional formatting with proper section titles, legal terminology, and clarity. Use plain English where possible while maintaining legal validity.

`;
  },

  "Freelance Contract": (fields) => {
    return `Generate a professional Freelance Service Agreement:

CONTEXT:
- Output: Plain text only (no HTML)
- Document Style: Comprehensive but clear contract
- Purpose: Define service terms between freelancer and client

DATA:
Client: ${fields.companyName}${fields.companyAddress ? ` | ${fields.companyAddress}` : ""}
Freelancer: ${fields.recipientName}
Project: ${fields.projectScope}
Deliverables: ${fields.deliverables}
Payment: ${fields.paymentTerms}
${fields.revisions ? `Revisions: ${fields.revisions}` : ""}
${fields.additionalTerms ? `Additional Terms: ${fields.additionalTerms}` : ""}

DOCUMENT STRUCTURE:
1. Header: "FREELANCE SERVICE AGREEMENT"
2. Parties: Clear identification of client and freelancer
3. Services: Detailed project scope and deliverables
4. Timeline: Project schedule, milestones, deadlines
5. Compensation: Payment amounts, schedule, method
6. Revision Process: Number of revisions, feedback cycle
7. Intellectual Property: Ownership of deliverables
8. Confidentiality: Protection of sensitive information
9. Independent Contractor Status: Tax and employment clarification
10. Termination: Conditions, notice periods, kill fees
11. Limitation of Liability
12. Dispute Resolution

FORMAT REQUIREMENTS:
- Use clear section headings
- Include bullet points for key terms
- Use plain language while maintaining legal validity
- Include signature blocks for both parties

The final document should protect both parties' interests while clearly establishing expectations and deliverables.`;
  },

  "Offer Letter": (fields) => {
    return `Generate a professional Employment Offer Letter:

CONTEXT:
- Output: Plain text only (no HTML)
- Document Style: Formal business letter
- Purpose: Extend job offer with clear terms

DATA:
Employer: ${fields.companyName}${fields.companyAddress ? ` | ${fields.companyAddress}` : ""}
Candidate: ${fields.recipientName}
Position: ${fields.position}
${fields.location ? `Location: ${fields.location}` : ""}
Start Date: ${fields.startDate}
${fields.duration ? `Term: ${fields.duration}` : ""}
${fields.workingDays ? `Working Days: ${fields.workingDays}` : ""}
Hours: ${fields.workingHours}
Compensation: ${fields.compensation}
${fields.benefits ? `Benefits: ${fields.benefits}` : ""}
${fields.additionalTerms ? `Additional Terms: ${fields.additionalTerms}` : ""}

DOCUMENT STRUCTURE:
1. Company Letterhead (placeholder: [LOGO_IMAGE])
2. Current Date
3. Candidate's Name and Address
4. Subject Line: "Offer of Employment: ${fields.position}"
5. Welcoming Introduction
6. Position Details: Title, Department, Reporting Structure
7. Start Date and Location
8. Compensation Package
9. Benefits Summary
10. Working Hours and Conditions
11. Employment Terms (At-will status, probation, etc.)
12. Acceptance Instructions
13. Closing
14. Signature Block (placeholder: [SIGNATURE_IMAGE])

FORMAT REQUIREMENTS:
- Use professional business letter format
- Keep tone warm yet professional
- Clear paragraph breaks between sections
- Include signature line for company representative

This letter should make the candidate feel valued while clearly communicating all terms of employment.`;
  },

  "Employment Contract": (fields) => {
    return `Generate a comprehensive Employment Contract:

CONTEXT:
- Output: Plain text only (no HTML)
- Document Style: Formal legal agreement
- Purpose: Define employment relationship and terms

DATA:
Employer: ${fields.companyName}${fields.companyAddress ? ` | ${fields.companyAddress}` : ""}
Employee: ${fields.recipientName}
Position: ${fields.position}
${fields.location ? `Location: ${fields.location}` : ""}
Start Date: ${fields.startDate}
${fields.duration ? `Term: ${fields.duration}` : ""}
${fields.workingDays ? `Working Days: ${fields.workingDays}` : ""}
Hours: ${fields.workingHours}
Compensation: ${fields.compensation}
${fields.benefits ? `Benefits: ${fields.benefits}` : ""}
${fields.additionalTerms ? `Additional Terms: ${fields.additionalTerms}` : ""}

DOCUMENT STRUCTURE:
1. Title: "EMPLOYMENT CONTRACT"
2. Parties: Employer and employee identification
3. Position & Duties: Job title, responsibilities, reporting structure
4. Term: Employment start date, probationary period if applicable
5. Compensation: Salary/wages, payment schedule, bonus structure
6. Benefits: Insurance, retirement, time off policies
7. Work Schedule: Hours, location, flexibility
8. Confidentiality: Protection of company information
9. Intellectual Property: Ownership of work product
10. Non-Compete/Non-Solicitation (if applicable)
11. Termination Conditions: Notice periods, severance
12. Governing Law
13. Dispute Resolution
14. Signatures

FORMAT REQUIREMENTS:
- Clear section headings
- Numbered or bulleted clauses for clarity
- Professional legal language but plain enough for non-lawyers
- Signature blocks for both employer and employee

This contract should protect the employer's interests while being fair and transparent to the employee.`;
  }
};

/**
 * Process HTML content in contract text
 * @param {string} text - Contract text with potential HTML
 * @returns {object} - Extracted data and processed text
 */
function processHtmlContent(text) {
  try {
    const result = {
      extractedDate: null,
      extractedLocation: null,
      processedText: text
    };

    // Check if text contains HTML
    if (text.includes('<div') || text.includes('<span')) {
      const $ = cheerio.load(text);

      // Extract date and location from spans
      $('span').each(function() {
        const content = $(this).text().trim();
        if (content.startsWith('Date:')) {
          result.extractedDate = content.replace('Date:', '').trim();
        } else if (content.includes('Location:')) {
          result.extractedLocation = content.replace('Location:', '').trim();
        }
      });

      // Remove HTML tags
      result.processedText = text
        .replace(/<div[^>]*>|<\/div>|<span[^>]*>|<\/span>/g, '')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
    }

    return result;
  } catch (error) {
    console.error("Error processing HTML:", error);
    return { 
      extractedDate: null, 
      extractedLocation: null, 
      processedText: text 
    };
  }
}

/**
 * Generate contract text using AI
 * @param {string} type - Contract type
 * @param {object} fields - Contract fields
 * @returns {Promise<string>} - AI generated contract text
 */
async function generateContractText(type, fields) {
  // Create cache key based on type and fields
  const cacheKey = `${type}-${JSON.stringify(fields)}`;

  // Check cache first
  const cachedContract = contractCache.get(cacheKey);
  if (cachedContract) {
    return cachedContract;
  }

  // Get the appropriate prompt function
  const promptFunction = CONTRACT_PROMPTS[type];
  if (!promptFunction) {
    throw new Error(`Unknown contract type: ${type}`);
  }

  // Generate prompt and get AI response
  const prompt = promptFunction(fields);
  
  const result = await geminiModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2, // Lowered for more deterministic output
      topK: 40,
      topP: 0.8,
      maxOutputTokens: 2048,
    },
  });

  const response = await result.response;
  const contract = response.text();

  // Store in cache
  contractCache.set(cacheKey, contract);

  return contract;
}

/**
 * Parse contract text into structured sections
 * @param {string} contractText - Raw contract text
 * @returns {Array} - Array of parsed sections
 */
function parseContractSections(contractText) {
  const lines = contractText.split('\n');
  const sections = [];
  
  let currentSection = null;
  let currentContent = [];
  let inBulletList = false;
  let bulletItems = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      // End bullet list if active
      if (inBulletList && bulletItems.length > 0) {
        currentContent.push({ type: 'bullets', items: [...bulletItems] });
        bulletItems = [];
        inBulletList = false;
      }
      continue;
    }
    
    // Check for heading (section titles)
    if (trimmedLine.toUpperCase() === trimmedLine && trimmedLine.length > 10) {
      // Save previous section if exists
      if (currentSection) {
        // Add any remaining bullet items
        if (inBulletList && bulletItems.length > 0) {
          currentContent.push({ type: 'bullets', items: [...bulletItems] });
          bulletItems = [];
          inBulletList = false;
        }
        
        sections.push({
          title: currentSection,
          content: [...currentContent]
        });
      }
      
      // Start new section
      currentSection = trimmedLine;
      currentContent = [];
    }
    // Handle bullet points
    else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
      if (!inBulletList) {
        inBulletList = true;
      }
      
      bulletItems.push(trimmedLine.substring(1).trim());
    }
    // Regular text
    else {
      // End bullet list if active
      if (inBulletList && bulletItems.length > 0) {
        currentContent.push({ type: 'bullets', items: [...bulletItems] });
        bulletItems = [];
        inBulletList = false;
      }
      
      // Add text to current section
      currentContent.push({ type: 'text', value: trimmedLine });
    }
  }
  
  // Save last section if exists
  if (currentSection) {
    // Add any remaining bullet items
    if (inBulletList && bulletItems.length > 0) {
      currentContent.push({ type: 'bullets', items: [...bulletItems] });
    }
    
    sections.push({
      title: currentSection,
      content: [...currentContent]
    });
  }
  
  return sections;
}

/**
 * Create PDF from contract text
 * @param {string} contract - Contract text
 * @param {object} fields - Form fields
 * @param {string} type - Contract type
 * @returns {Promise<object>} - Document info with file URL
 */
async function createPdfFromContract(contract, fields, type) {
  try {
    // 1. Verify and create uploads directory if needed
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`Created uploads directory: ${uploadsDir}`);
    }

    // 2. Verify all required fonts exist
    const fontFiles = {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf'
    };

    for (const [style, fontFile] of Object.entries(fontFiles)) {
      const fontPath = path.join(__dirname, 'fonts', fontFile);
      if (!fs.existsSync(fontPath)) {
        throw new Error(`Missing required font file: ${fontFile}`);
      }
    }

    // 3. Process contract content
    const currentDate = new Date().toLocaleDateString();
    const { extractedDate, extractedLocation, processedText } = processHtmlContent(contract);

    const contractText = processedText
      .replace(/\[OWNER_SIGNATURE\]/g, "")
      .replace(/\[TENANT_SIGNATURE\]/g, "")
      .replace(/\[SIGNATURE_IMAGE\]/g, "")
      .replace(/\[Date\]/g, currentDate)
      .replace(/\[Current Date\]/g, currentDate);

    // 4. Generate PDF document
    const docDefinition = createPdfDocDefinition(
      contractText,
      fields,
      type,
      currentDate,
      extractedDate || currentDate,
      extractedLocation
    );

    // 5. Create PDF file
    const fileName = `${type.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const writeStream = fs.createWriteStream(filePath);

        pdfDoc.pipe(writeStream);
        pdfDoc.end();

        writeStream.on('finish', () => {
          // Verify file was created
          if (!fs.existsSync(filePath)) {
            reject(new Error("PDF file was not created"));
            return;
          }
          console.log(`PDF successfully created: ${filePath}`);
          resolve({ fileName, fileUrl: `/uploads/${fileName}` });
        });

        writeStream.on('error', (err) => {
          console.error("Write stream error:", err);
          reject(new Error(`Failed to write PDF: ${err.message}`));
        });
      } catch (err) {
        console.error("PDF generation error:", err);
        reject(new Error(`Failed to create PDF: ${err.message}`));
      }
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}

/**
 * Create PDFMake document definition
 * @param {string} contractText - Contract text
 * @param {object} fields - Form fields
 * @param {string} type - Contract type
 * @param {string} currentDate - Current date string
 * @param {string} extractedDate - Date extracted from contract
 * @param {string} extractedLocation - Location extracted from contract
 * @returns {object} - PDFMake document definition
 */
function createPdfDocDefinition(contractText, fields, type, currentDate, extractedDate, extractedLocation) {
  const content = [];
  
  // Add logo if available
  if (fields.logoImage) {
    content.push({
      image: fields.logoImage,
      width: 200,
      alignment: 'center',
      margin: [0, 0, 0, 20]
    });
  }
  
  // Add header with date and location
  if (extractedDate || extractedLocation) {
    content.push({
      columns: [
        {
          width: '*',
          text: extractedDate ? `Date: ${extractedDate}` : '',
          style: 'small',
          alignment: 'left'
        },
        {
          width: '*',
          text: extractedLocation ? `Location: ${extractedLocation}` : '',
          style: 'small',
          alignment: 'right'
        }
      ],
      margin: [0, 0, 0, 10]
    });
  }
  
  // Add title
  content.push({
    text: type.toUpperCase(),
    style: 'title',
    margin: [0, 0, 0, 15],
    alignment: 'center'
  });

  // Process contract text by lines
  const lines = contractText.split('\n');
  let inSignatureSection = false;
  let currentSection = null;
  let sectionStack = [];
  let bulletItems = [];
  let inBulletList = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Skip signature lines as we'll add our own
    if (trimmedLine.includes("SIGNATURE") || 
        trimmedLine.includes("Owner:") ||
        trimmedLine.includes("Tenant:") ||
        trimmedLine.includes("Witness:")) {
      inSignatureSection = true;
      continue;
    }
    
    if (inSignatureSection) continue;
    
    // Check for section headings
    if (trimmedLine.endsWith(':') && !trimmedLine.startsWith('•') && !trimmedLine.startsWith('-')) {
      // Close any open bullet list
      if (inBulletList && bulletItems.length > 0) {
        if (currentSection) {
          sectionStack.push({
            ul: bulletItems.map(item => ({ text: item, margin: [0, 2, 0, 2] })),
            margin: [0, 5, 0, 10]
          });
        } else {
          content.push({
            ul: bulletItems.map(item => ({ text: item, margin: [0, 2, 0, 2] })),
            margin: [0, 5, 0, 10]
          });
        }
        bulletItems = [];
        inBulletList = false;
      }
      
      // Add previous section to content if exists
      if (currentSection) {
        content.push({
          stack: [
            { text: currentSection, style: 'heading', margin: [0, 10, 0, 5] },
            ...sectionStack
          ]
        });
        sectionStack = [];
      }
      
      currentSection = trimmedLine;
    }
    // Handle bullet points
    else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
      if (!inBulletList) {
        inBulletList = true;
      }
      bulletItems.push(trimmedLine.substring(1).trim());
    }
    // Regular text
    else {
      // Close any open bullet list
      if (inBulletList && bulletItems.length > 0) {
        if (currentSection) {
          sectionStack.push({
            ul: bulletItems.map(item => ({ text: item, margin: [0, 2, 0, 2] })),
            margin: [0, 5, 0, 10]
          });
        } else {
          content.push({
            ul: bulletItems.map(item => ({ text: item, margin: [0, 2, 0, 2] })),
            margin: [0, 5, 0, 10]
          });
        }
        bulletItems = [];
        inBulletList = false;
      }
      
      if (currentSection) {
        sectionStack.push({ text: trimmedLine, style: 'paragraph' });
      } else {
        content.push({ text: trimmedLine, style: 'paragraph' });
      }
    }
  }
  
  // Add final section if exists
  if (currentSection) {
    // Add any remaining bullet items
    if (inBulletList && bulletItems.length > 0) {
      sectionStack.push({
        ul: bulletItems.map(item => ({ text: item, margin: [0, 2, 0, 2] })),
        margin: [0, 5, 0, 10]
      });
    }
    
    content.push({
      stack: [
        { text: currentSection, style: 'heading', margin: [0, 10, 0, 5] },
        ...sectionStack
      ]
    });
  }
  
  // Add signature section
  addSignatureSection(content, type, fields, currentDate);
  
  return {
    content: content,
    styles: {
      title: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 10]
      },
      heading: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      subheading: {
        fontSize: 12,
        bold: true,
      },
      paragraph: {
        fontSize: 10,
        margin: [0, 5, 0, 5]
      },
      small: {
        fontSize: 8,
      }
    },
    defaultStyle: {
      fontSize: 10
    },
    pageMargins: [40, 40, 40, 40]
  };
}

/**
 * Add signature section to the document
 * @param {Array} content - Document content array
 * @param {string} type - Contract type
 * @param {object} fields - Form fields
 * @param {string} currentDate - Current date string
 */
function addSignatureSection(content, type, fields, currentDate) {
  content.push({ text: 'SIGNATURES', style: 'heading', alignment: 'center', margin: [0, 20, 0, 10] });

  if (type === 'Rental Contract') {
    content.push({
      columns: [
        {
          width: '*',
          stack: [
            { text: "Owner's Signature", style: 'subheading', alignment: 'center' },
            fields.ownerSignature ? {
              image: fields.ownerSignature,
              width: 150,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            } : { text: '', margin: [0, 40, 0, 0] },
            { text: fields.ownerName, alignment: 'center' },
            { text: currentDate, alignment: 'center', margin: [0, 5, 0, 0] }
          ]
        },
        {
          width: '*',
          stack: [
            { text: "Tenant's Signature", style: 'subheading', alignment: 'center' },
            fields.tenantSignature ? {
              image: fields.tenantSignature,
              width: 150,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            } : { text: '', margin: [0, 40, 0, 0] },
            { text: fields.recipientName, alignment: 'center' },
            { text: currentDate, alignment: 'center', margin: [0, 5, 0, 0] }
          ]
        }
      ]
    });

    content.push(
      { text: 'Witness (Optional):', style: 'subheading', alignment: 'center', margin: [0, 20, 0, 5] },
      { text: 'Name: ____________________', alignment: 'center', margin: [0, 5, 0, 5] },
      { text: 'Signature: ____________________', alignment: 'center', margin: [0, 5, 0, 5] },
      { text: 'Date: ____________________', alignment: 'center', margin: [0, 5, 0, 5] }
    );
  } else {
    // Company signature for other contract types
    const sigSection = [
      { text: 'Authorized Signatory:', style: 'subheading', alignment: 'center', margin: [0, 10, 0, 10] }
    ];

    if (fields.signatureImage) {
      sigSection.push({
        image: fields.signatureImage,
        width: 150,
        alignment: 'center',
        margin: [0, 10, 0, 10]
      });
    } else {
      sigSection.push({ text: '', margin: [0, 40, 0, 0] });
    }

    sigSection.push(
      { text: fields.companyName, alignment: 'center' },
      { text: `Date: ${currentDate}`, alignment: 'center', margin: [0, 5, 0, 0] }
    );

    content.push({
      stack: sigSection,
      margin: [0, 0, 0, 20]
    });
    
    // Add recipient signature for employment contracts
    if (type === 'Employment Contract' || type === 'Freelance Contract') {
      content.push(
        { text: 'Accepted By:', style: 'subheading', alignment: 'center', margin: [0, 20, 0, 10] },
        { text: `${fields.recipientName}`, alignment: 'center' },
        { text: 'Signature: ____________________', alignment: 'center', margin: [0, 15, 0, 5] },
        { text: 'Date: ____________________', alignment: 'center', margin: [0, 5, 0, 5] }
      );
    }
  }
}

/**
 * Contract generation endpoint
 */
app.post("/generate-contract", async (req, res) => {
  try {
    const { type, fields } = req.body;

    // Input validation
    if (!type) {
      return res.status(400).json({ error: "Contract type is required" });
    }
    
    if (!fields) {
      return res.status(400).json({ error: "Contract fields are required" });
    }
    
    if (!CONTRACT_PROMPTS[type]) {
      return res.status(400).json({ 
        error: `Unknown contract type: ${type}`,
        validTypes: Object.keys(CONTRACT_PROMPTS) 
      });
    }

    // Generate contract text
    const contract = await generateContractText(type, fields);

    // Create PDF document
    const docInfo = await createPdfFromContract(contract, fields, type);

    // Return the contract text and file URL
    res.json({
      contract,
      fileUrl: docInfo.fileUrl,
    });
  } catch (error) {
    console.error("Error generating contract:", error);
    res.status(500).json({ 
      error: "Failed to generate document", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok",
    version: process.env.npm_package_version || "1.0.0"
  });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "An unexpected error occurred",
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${uploadsDir}`);
});

module.exports = app; // Export for testing