# NeoSante Pharmacy Application

## Project Overview

NeoSante Pharmacy is a comprehensive pharmacy management and product discovery platform that allows users to search and filter products, find pharmacies, and provides robust management tools for administrators, pharmacists, and users.

## Features

### User Features
- **Product Discovery**
    - Search and browse pharmaceutical products
    - Advanced filtering options for products
    - Detailed product information and availability

- **Pharmacy Locator**
    - Filter pharmacies by open status
    - View pharmacy details and operating hours

### Pharmacist Features
- **Pharmacy Management**
    - Create and manage pharmacy profiles
    - Add and update product inventories
    - Manage pharmacy information and operating hours

### Admin Features
- **System Management**
    - Approve pharmacist registrations
    - User and pharmacy access control
    - Platform-wide configuration

## Technologies Used

### Backend
- **Framework**: NestJS
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT
- **Email Service**: Nodemailer
- **File Storage**: AWS S3

### Development Tools
- TypeScript
- Jest (Testing)
- Prettier
- ESLint

## Prerequisites

- Node.js (v16.x or later)
- MongoDB (v7.x or later)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone hhttps://github.com/Mohamed072005/NeoSante-Pharmacy.git
   cd NeoSante-Pharmacy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file with the following configuration:
   ```
   # Server Configuration
   PORT=5000
   FRONT_APP_PORT=3000

   # Database Configuration
   DB_URI=mongodb://localhost:27017/neosante_pharmacy

   # Email Service Configuration
   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_password

   # Security Configuration
   SECRET_KEY=your_long_random_secret_key

   # URL Configuration
   BACK_END_URL=http://localhost:3000
   FRONT_END_URL=http://localhost:3001

   # AWS S3 Configuration
   AWS_S3_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_BUCKET_NAME=neosante-pharmacy-bucket
   ```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

## Environment Variables Explanation

- `PORT`: The port on which the backend server will run
- `DB_URI`: MongoDB connection string
- `EMAIL_USER`: Email address used for sending system emails
- `EMAIL_PASSWORD`: Password or app-specific password for the email account
- `SECRET_KEY`: Secret key used for JWT token generation and encryption
- `BACK_END_URL`: Full URL of the backend server
- `FRONT_END_URL`: Full URL of the frontend application
- `FRONT_APP_PORT`: Port for the frontend application
- `AWS_S3_REGION`: AWS S3 bucket region
- `AWS_ACCESS_KEY_ID`: AWS access key for S3 operations
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for S3 operations
- `AWS_BUCKET_NAME`: Name of the S3 bucket for file storage

## Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run start`: Start the application
- `npm run start:dev`: Start in development mode with hot reload
- `npm run test`: Run unit tests
- `npm run lint`: Run ESLint for code quality checks

## Testing

- Unit Tests: `npm run test`

## Project Structure

```
src/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── role/
│   ├── email/
│   ├── products/
│   ├── pharmacy/
│   └── category/
├── common/
│   ├── guards/
│   ├── interceptors/
│   ├── decorators/
│   ├── pipes/
│   ├── transformers/
│   ├── types/
│   └── filters/
└── core/
    ├── config/
    ├── databases/
    ├── guards/
    ├── helpers/
    ├── logger/
    ├── services/
    ├── utils/
    └── filters/
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Considerations

- Environment variables kept secret
- JWT for authentication
- Secure AWS S3 configuration
- Input validation
- Email service security
