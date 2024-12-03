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
exports.gs2c = exports.serverBase = exports.baseURL = exports.commonHeader = void 0;
const express_1 = __importDefault(require("express"));
const gs2c = express_1.default.Router();
exports.gs2c = gs2c;
exports.commonHeader = {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.8",
    "cache-control": "no-cache",
    "origin": "https://ru88ebgdpm.qudxdfac.biz",
    "authority": "ru88ebgdpm.qudxdfac.biz",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Brave\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
};
exports.baseURL = 'https://ru88ebgdpm.qudxdfac.biz';
exports.serverBase = "http://localhost:3008";
gs2c.all('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('gs2c', { mgckey: req.query["mgckey"] });
}));
gs2c.post("/ge/v3/gameService", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const urlEncodedData = Object.keys(req.body)
            .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(req.body[key]))
            .join('&');
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "POST",
            body: urlEncodedData,
            headers: Object.assign(Object.assign({}, exports.commonHeader), { "content-type": "application/x-www-form-urlencoded", referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.text();
        console.log(data);
        res.set("Content-Type", "text/html;charset=UTF-8");
        res.status(200).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
gs2c.get("/announcements/unread/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "GET",
            headers: Object.assign(Object.assign({}, exports.commonHeader), { "content-type": "application/x-www-form-urlencoded", referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "", "cookie": ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.cookie) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.text();
        res.set("Content-Type", "text/html;charset=UTF-8");
        res.status(200).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
gs2c.post("/saveSettings.do", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const urlEncodedData = Object.keys(req.body)
            .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(req.body[key]))
            .join('&');
        console.log(urlEncodedData);
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "POST",
            body: urlEncodedData,
            headers: Object.assign(Object.assign({}, exports.commonHeader), { "content-type": "application/x-www-form-urlencoded", referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "", "cookie": ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.cookie) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.text();
        res.set("Content-Type", "application/x-www-form-urlencoded");
        res.status(200).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
gs2c.get("/promo/active/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "GET",
            headers: Object.assign(Object.assign({}, exports.commonHeader), { "content-type": "application/json", referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "", "cookie": ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.cookie) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        res.status(200).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
gs2c.get("/promo/race/details", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "GET",
            headers: Object.assign(Object.assign({}, exports.commonHeader), { "content-type": "application/json", referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "", "cookie": ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.cookie) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        res.status(200).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
gs2c.get("/promo/race/prizes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "GET",
            headers: Object.assign(Object.assign({}, exports.commonHeader), { "content-type": "application/json", referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "", "cookie": ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.cookie) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        res.status(200).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
gs2c.get("/promo/frb/available", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "GET",
            headers: Object.assign(Object.assign({}, exports.commonHeader), { "content-type": "application/json", referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "", "cookie": ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.cookie) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        res.status(200).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
gs2c.post("/promo/tournament/player/choice/OPTIN/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "POST",
            body: JSON.stringify(req.body),
            headers: Object.assign(Object.assign({}, exports.commonHeader), { "content-type": "application/json", referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        res.status(200).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
gs2c.post("/promo/race/player/choice/OPTIN/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "POST",
            body: JSON.stringify(req.body),
            headers: Object.assign(Object.assign({}, exports.commonHeader), { "content-type": "application/json", referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "", "cookie": ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.cookie) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        res.status(200).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
gs2c.get("/promo/tournament/details/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "GET",
            headers: Object.assign(Object.assign({}, exports.commonHeader), { "content-type": "application/json", referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "", "cookie": ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.cookie) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        res.status(200).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
gs2c.get("/promo/tournament/scores/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "GET",
            headers: Object.assign(Object.assign({}, exports.commonHeader), { "content-type": "application/json", referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "", "cookie": ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.cookie) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        res.status(200).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
gs2c.get("/reloadBalance.do", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "GET",
            headers: Object.assign(Object.assign({}, exports.commonHeader), { referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "", "cookie": ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.cookie) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.text();
        res.set('content-type', 'text/html;charset=UTF-8');
        res.status(200).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
gs2c.options('/stats.do', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "OPTIONS",
            headers: Object.assign(Object.assign({}, exports.commonHeader), { referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "", "cookie": ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.cookie) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.text();
        res.set('content-type', 'text/html;charset=UTF-8');
        res.status(204).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
gs2c.get("/common/v1/games-html5/games/vs/vs20olympxmas/desktop/customizations.info", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const response = yield fetch(`${exports.baseURL}${req.originalUrl}`, {
            "method": "GET",
            headers: Object.assign(Object.assign({}, exports.commonHeader), { referer: ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.replace(`${exports.serverBase}/gs2c/`, `${exports.baseURL}/gs2c/html5Game.do`)) || "", "cookie": ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.cookie) || "" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.text();
        res.set('content-type', 'text/html;charset=UTF-8');
        res.status(200).send(data);
    }
    catch (error) {
        console.log(`${req.path} error:`, error);
        res.status(400).send(error);
    }
}));
