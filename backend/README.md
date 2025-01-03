# RaceTrack Backend

<p align="center">
  <img src="path/to/your/logo.png" width="200" alt="RaceTrack Logo" />
</p>

## Description

Backend server for real-time race car tracking system. Built with [NestJS](https://nestjs.com/) framework.

## Key Features

- 🏎️ Real-time race car position tracking
- ⏱️ Lap time measurement
- 🚥 Race flag signals management
- 📊 Race statistics and analytics
- 👥 Multiple user interfaces (judges, mechanics, spectators)

## Prerequisites

- Node.js (version >= 14.x)
- npm (version >= 6.x)
- PostgreSQL (version >= 12)

## Installation

```bash
# Clone the repository
$ git clone https://github.com/your-username/RaceTrack-Backend.git

# Install dependencies
$ npm install

# Configure environment variables
$ cp .env.example .env
```

## Running the app

```bash
# Development mode
$ npm run start

# Watch mode
$ npm run start:dev

# Production mode
$ npm run start:prod
```

## Testing

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## Project Structure

```
src/
├── employee-interfaces/     # Staff-specific interfaces
├── gateways/               # WebSocket gateways
├── models/                 # Database models
├── modules/                # Main application modules
└── public/                # Public endpoints
```

## API Documentation

API documentation is available at `/api-docs` when running the server (requires SwaggerUI).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact [your-email@example.com](mailto:your-email@example.com)