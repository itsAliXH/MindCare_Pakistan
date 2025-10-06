# MindCare Pakistan - Backend API

A Node.js/Express backend API for the MindCare Pakistan therapist finder application. This API provides endpoints for searching, filtering, and managing therapist data with MongoDB integration.

## 🚀 Features

- **RESTful API** for therapist management
- **MongoDB Integration** with Mongoose ODM
- **Advanced Search** with text indexing and regex support
- **Real-time Filtering** by city, gender, consultation modes
- **Pagination** for efficient data loading
- **CSV Data Import** functionality
- **Environment Configuration** with dotenv
- **CORS Support** for frontend integration
- **TypeScript** for type safety

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/itsAliXH/MindCare_Pakistan.git
   cd MindCare_Pakistan/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Configure Environment Variables**
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=4000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:4200
   API_PREFIX=/api
   ```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Update `MONGODB_URI` to `mongodb://localhost:27017/mindcare`

### Import Data
```bash
# Import therapist data from CSV
npm run seed
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:4000` with hot reload enabled.

### Production Mode
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Base URL
```
http://localhost:4000/api
```

### Therapists

#### Get All Therapists
```http
GET /api/therapists
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12, max: 100)
- `search` (string): Search term for name, expertise, education
- `cities` (string): Comma-separated city names
- `genders` (string): Comma-separated gender values
- `modes` (string): Comma-separated consultation modes

**Example:**
```http
GET /api/therapists?page=1&limit=10&search=psychology&cities=Karachi,Lahore&genders=Female&modes=Online
```

**Response:**
```json
{
  "page": 1,
  "limit": 10,
  "total": 79,
  "data": [
    {
      "_id": "...",
      "name": "Dr. Sarah Ahmed",
      "gender": "Female",
      "city": "Karachi",
      "experienceYear": 5,
      "email": "sarah@example.com",
      "phone": "+92-300-1234567",
      "modes": ["Online", "In-person"],
      "education": ["PhD Psychology", "MS Clinical Psychology"],
      "experience": ["Clinical Psychologist at ABC Hospital"],
      "expertise": ["Anxiety", "Depression", "CBT"],
      "about": "Experienced clinical psychologist...",
      "feeAmount": 3000,
      "feeCurrency": "PKR"
    }
  ]
}
```

#### Get Single Therapist
```http
GET /api/therapists/:id
```

#### Get Filter Options
```http
GET /api/therapists/_filters/options
```

**Response:**
```json
{
  "cityCounts": [
    {"_id": "Karachi", "count": 25},
    {"_id": "Lahore", "count": 20}
  ],
  "genderCounts": [
    {"_id": "Female", "count": 45},
    {"_id": "Male", "count": 34}
  ],
  "modeCounts": [
    {"_id": "In-person", "count": 60},
    {"_id": "Online", "count": 55}
  ]
}
```

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok"
}
```

## 🔍 Search Features

### Text Search
- **Full-text search** across name, expertise, education, and about fields
- **Single character search** support with regex fallback
- **Case-insensitive** matching
- **Debounced** for performance

### Filtering
- **City filtering** with exact matches
- **Gender filtering** (Male/Female)
- **Consultation mode filtering** (In-person/Online)
- **Combined filters** with AND logic

### Pagination
- **Page-based pagination** with configurable limits
- **Total count** included in responses
- **Efficient database queries** with skip/limit

## 📊 Data Model

### Therapist Schema
```typescript
{
  name: string;                    // Required
  profileUrl?: string;
  gender?: string;
  city?: string;
  experienceYear?: number;
  email?: string;
  emailsAll?: string[];
  phone?: string;
  modes?: string[];                // Consultation modes
  education?: string[];            // Array of education entries
  experience?: string[];           // Array of experience entries
  expertise?: string[];            // Array of expertise areas
  about?: string;
  feesRaw?: string;               // Original fee text
  feeAmount?: number;             // Parsed numeric amount
  feeCurrency?: string;           // Currency code (PKR, USD, etc.)
  createdAt?: Date;
}
```

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── index.ts              # Server entry point
│   ├── models/
│   │   └── therapists.ts     # Mongoose schema
│   ├── routes/
│   │   └── therapists.ts     # API routes
│   └── utils/
│       └── csvImport.ts      # CSV data import utility
├── data/
│   └── therapists.csv        # Source data file
├── .env                      # Environment variables
├── .env.example             # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## 🧪 Testing

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:4000/api/health

# Test therapist search
curl "http://localhost:4000/api/therapists?search=psychology&limit=5"

# Test filters
curl "http://localhost:4000/api/therapists?cities=Karachi&genders=Female"
```

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 http://localhost:4000/api/health
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `PORT` | Server port | 4000 |
| `NODE_ENV` | Environment mode | development |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:4200 |
| `API_PREFIX` | API route prefix | /api |

### MongoDB Indexes
The following indexes are automatically created:
- Text index on: `name`, `expertise`, `education`, `about`
- Single field indexes on: `city`, `gender`

## 🚀 Deployment

### Heroku
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git:
   ```bash
   git push heroku main
   ```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
MONGODB_URI=your_production_mongodb_uri
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

## 📈 Performance

### Optimization Features
- **Database indexing** for fast queries
- **Pagination** to limit data transfer
- **Text search optimization** with MongoDB text indexes
- **Connection pooling** with Mongoose
- **Response compression** (if enabled)

### Monitoring
- Request logging middleware
- Error handling and logging
- Health check endpoint for monitoring

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your `MONGODB_URI` in `.env`
   - Ensure MongoDB Atlas IP whitelist includes your IP
   - Verify network connectivity

2. **CORS Errors**
   - Update `CORS_ORIGIN` in `.env` to match your frontend URL
   - Check if frontend is running on the correct port

3. **Search Not Working**
   - Ensure text indexes are created: `npm run seed`
   - Check if data is properly imported

4. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Kill existing process: `lsof -ti:4000 | xargs kill`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with basic CRUD operations
- **v1.1.0** - Added advanced search and filtering
- **v1.2.0** - Added pagination and performance optimizations
- **v1.3.0** - Added CSV import functionality

---

**Made with ❤️ for MindCare Pakistan**
