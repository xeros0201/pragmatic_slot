import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { gs2c } from './src/router/gs2c';

const app = express();

// Assuming these are defined elsewhere in your project
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.json());

// Middleware to parse URL-encoded data (e.g., for form submissions)
app.use(express.urlencoded({ extended: true }));
// Middleware to check for static assets and download if not present
app.use('/gs2c',gs2c)
app.use(async function(req, res, next) {
  const filePath = path.join(PUBLIC_DIR, req.path);
  
  // Exclude paths that should not be treated as static assets
  if (req.path.includes('api') || req.path.includes("undefined") || req.path.includes("null")) {
    return next();
  }

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    try {
      // Construct URL for downloading from example.com
      const url = `https://ru88ebgdpm.qudxdfac.biz${req.path}`;

      // Ensure the directory exists
      const directoryPath = path.dirname(filePath);
    

      // Download the file
      const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream',
      });

      const writer = createWriteStream(filePath);
      response.data.pipe(writer);
      fs.mkdirSync(directoryPath, { recursive: true });
      await new Promise((resolve, reject) => {
        
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Log successful download
      console.log(`File downloaded successfully: ${req.path}`);

      // Serve the file
      res.sendFile(filePath);
    } catch (error) {
      // Handle errors during download
      console.error(`Error downloading file: ${req.path}`, error);
      res.status(404).send('File not found and could not be downloaded.');
    }
  } else {
    // If file exists, just serve it
    res.sendFile(filePath);
  }
});

// Serve static files from the public directory
app.use(express.static(PUBLIC_DIR));

// Start server
const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});