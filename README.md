# SSL Checker API

SSL domain checker API built with Node.js and Express. This API allows you to check SSL certificate information for any domain.

## Features

- Check SSL certificate details for any domain
- Returns certificate CN, issuer, expiry date, and more
- RESTful API endpoint
- Docker support for easy deployment

## API Endpoint

### Check SSL Certificate

**GET** `/api/Domains/:domain`

**Example Request:**
```
GET /api/Domains/pingsut.com
```

**Example Response:**
```json
[
  {
    "domainName": "pingsut.com",
    "port": 443,
    "certCN": "pingsut.com",
    "issuer": "Google Trust Services",
    "expiryDate": "2026-01-25T03:26:37",
    "lastChecked": "2025-12-11T04:00:15.1441294",
    "userId": "User",
    "agent": 0,
    "silenced": false,
    "publicPrefix": true,
    "id": 4
  }
]
```

**Query Parameters:**
- `port` (optional): Port number to check (default: 443)

## Installation and Usage

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Test the API:
```bash
curl http://localhost:3000/api/Domains/pingsut.com
```

### Docker

1. Build the Docker image:
```bash
docker build -t sslchecker .
```

2. Run the container:
```bash
docker run -p 3000:3000 sslchecker
```

3. Test the API:
```bash
curl http://localhost:3000/api/Domains/pingsut.com
```

### Docker Compose

1. Start the service:
```bash
docker-compose up -d
```

2. Stop the service:
```bash
docker-compose down
```

## Environment Variables

- `PORT`: Port to run the server on (default: 3000)

## Additional Endpoints

- **GET** `/health` - Health check endpoint
- **GET** `/` - API information and available endpoints
