const express = require('express');
const path = require('path');

const app = express();
const adminDir = path.join(__dirname, '..', 'public', 'admin');

app.use(express.static(adminDir));

// Static files are served from `public/admin`. No SPA fallback needed because
// admin UI uses separate HTML files (chapter_organizations.html, categories.html, etc.).

const port = process.env.ADMIN_PORT || 3002;
app.listen(port, () => {
  console.log(`Admin UI available at http://localhost:${port}`);
});
