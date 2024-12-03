"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const fs_2 = require("fs");
const gs2c_1 = require("./router/gs2c");
const app = (0, express_1.default)();
app.set('view engine', 'ejs');
app.set('views', './src/views');
// Assuming these are defined elsewhere in your project
const PUBLIC_DIR = path_1.default.join(__dirname, "..", 'public');
app.use(express_1.default.json());
// Middleware to parse URL-encoded data (e.g., for form submissions)
app.use(express_1.default.urlencoded({ extended: true }));
// Middleware to check for static assets and download if not present
app.use('/gs2c', gs2c_1.gs2c);
app.use(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = path_1.default.join(PUBLIC_DIR, req.path);
        // Exclude paths that should not be treated as static assets
        if (req.path.includes('api') || req.path.includes("undefined") || req.path.includes("null")) {
            return next();
        }
        // Check if the file exists
        if (!fs_1.default.existsSync(filePath)) {
            try {
                // Construct URL for downloading from example.com
                const url = `https://ru88ebgdpm.qudxdfac.biz${req.path}`;
                // Ensure the directory exists
                const directoryPath = path_1.default.dirname(filePath);
                // Download the file
                const response = yield (0, axios_1.default)({
                    method: 'GET',
                    url,
                    responseType: 'stream',
                });
                const writer = (0, fs_2.createWriteStream)(filePath);
                response.data.pipe(writer);
                fs_1.default.mkdirSync(directoryPath, { recursive: true });
                yield new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                // Log successful download
                console.log(`File downloaded successfully: ${req.path}`);
                // Serve the file
                res.sendFile(filePath);
            }
            catch (error) {
                // Handle errors during download
                console.error(`Error downloading file: ${req.path}`, error);
                res.status(404).send('File not found and could not be downloaded.');
            }
        }
        else {
            // If file exists, just serve it
            res.sendFile(filePath);
        }
    });
});
// Serve static files from the public directory
app.use(express_1.default.static(PUBLIC_DIR));
// Start server
const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
