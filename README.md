# Document Text Extractor

A full-stack web application that extracts text from PDF files and images using OCR technology. Users can upload documents, provide personal information, and get extracted text along with calculated 

## Features

- **File Upload**: Support for PDF files and images (PNG, JPG, JPEG)
- **Text Extraction**: Uses Tesseract.js for images and pdf-parse for PDFs
- **Age Calculation**: Automatically calculates age from date of birth
- **Clean UI**: Modern React frontend with drag-and-drop file upload
- **Real-time Processing**: Live feedback during document processing

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Wouter (lightweight routing)
- TanStack Query (data fetching)
- React Hook Form (form handling)
- Shadcn/ui components

### Backend
- Express.js
- TypeScript
- Multer (file upload handling)
- Tesseract.js (OCR for images)
- pdf-parse (PDF text extraction)
- Drizzle ORM with in-memory storage

## Prerequisites

- Node.js 18+ 
- npm or yarn package manager

## Local Development Setup

### 1. Clone or Download the Project

```bash
# If using git
git clone <your-repo-url>
cd document-text-extractor

# Or download and extract the project files
```

### 2. Install Dependencies

```bash
npm install
```

**Note**: The project includes some Replit-specific packages (`@replit/vite-plugin-*`) that are optional for local development. These packages will be ignored when `REPL_ID` environment variable is not set.

### 3. Start the Development Server

```bash
npm run dev
```

This will start both the Express backend and Vite frontend development servers:
- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:5000` (served by Express with Vite middleware)

### 4. Open in Browser

Navigate to `http://localhost:5000` in your web browser.

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utility functions
│   │   └── hooks/         # Custom React hooks
│   └── index.html
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # In-memory data storage
│   └── vite.ts           # Vite development setup
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema and validation
├── package.json
└── README.md
```

## API Endpoints

### POST /api/upload
Uploads a file and processes it for text extraction.

**Request:**
- `file`: PDF or image file (multipart/form-data)
- `firstName`: User's first name
- `lastName`: User's last name  
- `dateOfBirth`: Date in YYYY-MM-DD format

**Response:**
```json
{
  "id": 1,
  "fullName": "John Doe",
  "age": 30,
  "extractedText": "Extracted text content...",
  "fileName": "document.pdf",
  "fileType": "application/pdf"
}
```

### GET /api/document/:id
Retrieves a previously processed document by ID.

## Usage

1. **Upload Document**: 
   - Drag and drop a PDF or image file onto the upload area
   - Or click "Choose File" to browse and select a file

2. **Enter Personal Information**:
   - Fill in your first name, last name, and date of birth
   - All fields are required

3. **Process Document**:
   - Click "Process Document" to start text extraction
   - Wait for processing to complete (may take a few seconds)

4. **View Results**:
   - See your full name and calculated age
   - View the extracted text from your document
   - Copy text to clipboard or download results

## File Requirements

- **Supported formats**: PDF, PNG, JPG, JPEG
- **Maximum file size**: 10MB
- **Image requirements**: Clear text for better OCR accuracy
- **PDF requirements**: Text-based PDFs work best

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Troubleshooting

### Common Issues

1. **"No file uploaded" error**:
   - Ensure file is within size limit (10MB)
   - Check file format is supported
   - Try refreshing the page

2. **Poor text extraction quality**:
   - Use high-resolution images
   - Ensure good contrast between text and background
   - Try different file formats

3. **Server won't start**:
   - Check Node.js version (18+ required)
   - Delete `node_modules` and run `npm install` again
   - Ensure port 5000 is available

### Development Mode Issues

- Clear browser cache if seeing old versions
- Check console for JavaScript errors
- Restart the dev server if hot reload stops working

## Environment Variables

No environment variables are required for basic functionality. The application uses in-memory storage by default.

**Optional Environment Variables:**
- `REPL_ID`: Used by Replit-specific plugins (can be ignored for local development)
- `NODE_ENV`: Set to "production" for production builds

## Production Deployment

For production deployment:

1. Build the application:
   ```bash
   npm run build
   ```

2. Set NODE_ENV=production

3. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server/index.ts --name "document-extractor"
   ```

4. Configure reverse proxy (nginx/Apache) if needed

## License

This project is available for educational and development purposes.

## Support

For issues or questions about local development, check:
- Node.js and npm are properly installed
- All dependencies are installed with `npm install`
- Port 5000 is available
- File permissions allow reading/writing in the project directory
