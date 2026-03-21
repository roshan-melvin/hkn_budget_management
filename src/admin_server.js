// Simple HTTP server for admin interface
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.ADMIN_PORT || 3002;
const ADMIN_DIR = path.join(__dirname, '..', 'public', 'admin');

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Default to index.html
    let filePath = path.join(ADMIN_DIR, req.url === '/' ? 'index.html' : req.url);

    // Get file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = MIME_TYPES[extname] || 'application/octet-stream';

    // Read and serve the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>404 - Not Found</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            h1 { color: #e74c3c; }
                            a { color: #3498db; text-decoration: none; }
                        </style>
                    </head>
                    <body>
                        <h1>404 - Page Not Found</h1>
                        <p>The requested page could not be found.</p>
                        <p><a href="/">Go to Admin Home</a></p>
                    </body>
                    </html>
                `, 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🎯 Admin Server Running!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📍 Admin Interface: http://localhost:${PORT}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\nAvailable Pages:`);
    console.log(`  • Chapter Organizations: http://localhost:${PORT}/chapter_organizations.html`);
    console.log(`  • Academic Years: http://localhost:${PORT}/academic_years.html`);
    console.log(`  • Categories: http://localhost:${PORT}/categories.html`);
    console.log(`\n⚠️  Note: Make sure the backend server is running on port 4000`);
    console.log(`   Run: npm run backend (in another terminal)\n`);
});
