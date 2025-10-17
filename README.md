# Personal Website - Amos Cheruiyot

A modern, colorful personal website with animations built using Node.js, Express, and Tailwind CSS.

## Features

- 🎨 **Colorful Modern UI** - Built with Tailwind CSS and custom gradients
- ✨ **Smooth Animations** - CSS and JavaScript animations for better UX
- 📄 **PDF Resume Parser** - Upload PDF resume to automatically populate content
- 📱 **Responsive Design** - Works perfectly on all devices
- 🚀 **Fast Performance** - Optimized loading and interactions

## Technology Stack

- **Backend**: Node.js with Express
- **Frontend**: HTML, CSS (Tailwind), Vanilla JavaScript
- **PDF Processing**: pdf-parse library
- **File Upload**: Multer
- **Security**: Helmet, CORS

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and visit `http://localhost:3000`

## Features Overview

### PDF Resume Upload
- Drag & drop or click to select PDF resume
- Automatic parsing of contact information
- Skill extraction and display
- Experience extraction
- Dynamic content population

### Animations & Interactions
- Smooth scrolling navigation
- Fade-in animations on scroll
- Hover effects on cards and buttons
- Gradient background animations
- Parallax effects

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

## Project Structure

```
├── server.js          # Express server
├── package.json       # Dependencies and scripts
├── public/            # Static files
│   ├── index.html     # Main HTML file
│   ├── css/
│   │   └── style.css  # Custom CSS
│   ├── js/
│   │   └── main.js    # JavaScript functionality
│   └── images/        # Image assets
└── uploads/           # Temporary file uploads (created automatically)
```

## API Endpoints

- `GET /` - Serve the main website
- `POST /api/upload-resume` - Upload and parse PDF resume

## Development

To run in development mode with auto-reload:
```bash
npm run dev
```

To run in production mode:
```bash
npm start
```

## Customization

### Colors
The website uses a custom color palette defined in the Tailwind config:
- Primary: #6366f1 (Indigo)
- Secondary: #8b5cf6 (Purple)
- Accent: #06b6d4 (Cyan)
- Sunset: #f97316 (Orange)
- Pink: #ec4899

### Animations
Custom animations are defined in `public/css/style.css` and can be modified or extended as needed.

## Contributing

Feel free to fork this project and customize it for your own personal website!

## License

MIT License - feel free to use this code for your own personal website.