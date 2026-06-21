const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* ==========================================================
Configuration
========================================================== */

const ROOT_DIR = path.resolve(
__dirname,
"..",
".."
);

const PORT =
process.env.PORT || 8000;

/* ==========================================================
MIME Types
========================================================== */

const MIME_TYPES = {
".html": "text/html; charset=utf-8",
".css": "text/css; charset=utf-8",
".js": "application/javascript; charset=utf-8",
".json": "application/json; charset=utf-8",
".txt": "text/plain; charset=utf-8",


".png": "image/png",
".jpg": "image/jpeg",
".jpeg": "image/jpeg",
".gif": "image/gif",
".svg": "image/svg+xml",
".webp": "image/webp",
".ico": "image/x-icon",

".woff": "font/woff",
".woff2": "font/woff2",

".pdf": "application/pdf"


};

/* ==========================================================
Security Headers
========================================================== */

function getSecurityHeaders() {
const nonce = crypto
.randomBytes(16)
.toString("base64");


return {
    "X-Content-Type-Options":
        "nosniff",

    "X-Frame-Options":
        "DENY",

    "Referrer-Policy":
        "strict-origin-when-cross-origin",

    "Permissions-Policy":
        "camera=(), microphone=(), geolocation=()",

    "Cross-Origin-Opener-Policy":
        "same-origin",

    "Cross-Origin-Resource-Policy":
        "same-origin",

    "Content-Security-Policy": [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}'`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https://images.unsplash.com https://images.pexels.com https://via.placeholder.com",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'none'"
    ].join("; ")
};


}

/* ==========================================================
Helpers
========================================================== */

function sendError(
res,
status,
message
) {
res.writeHead(status, {
"Content-Type":
"text/plain; charset=utf-8"
});


res.end(message);


}

function getContentType(
filePath
) {
const ext = path
.extname(filePath)
.toLowerCase();


return (
    MIME_TYPES[ext] ||
    "application/octet-stream"
);


}

function isSafePath(
requestedPath
) {
const resolvedPath =
path.resolve(
ROOT_DIR,
"." + requestedPath
);


return resolvedPath.startsWith(
    ROOT_DIR
);


}

/* ==========================================================
Request Logger
========================================================== */

function logRequest(req, status) {
const now =
new Date().toISOString();


console.log(
    `[${now}] ${req.method} ${req.url} ${status}`
);


}

/* ==========================================================
Static File Handler
========================================================== */

function serveFile(
req,
res,
filePath
) {
fs.stat(
filePath,
(err, stats) => {
if (
err ||
!stats.isFile()
) {
logRequest(
req,
404
);


            return sendError(
                res,
                404,
                "Not Found"
            );
        }

        const headers = {
            ...getSecurityHeaders(),

            "Content-Type":
                getContentType(
                    filePath
                ),

            "Cache-Control":
                filePath.includes(
                    "/assets/"
                )
                    ? "public, max-age=86400"
                    : "no-cache"
        };

        res.writeHead(
            200,
            headers
        );

        const stream =
            fs.createReadStream(
                filePath
            );

        stream.on(
            "error",
            () => {
                logRequest(
                    req,
                    500
                );

                sendError(
                    res,
                    500,
                    "Internal Server Error"
                );
            }
        );

        stream.pipe(res);

        logRequest(
            req,
            200
        );
    }
);


}

/* ==========================================================
Server
========================================================== */

const server =
http.createServer(
(req, res) => {
try {
let requestPath =
decodeURIComponent(
req.url.split(
"?"
)[0]
);


            if (
                requestPath ===
                "/"
            ) {
                requestPath =
                    "/index.html";
            }

            if (
                !isSafePath(
                    requestPath
                )
            ) {
                logRequest(
                    req,
                    403
                );

                return sendError(
                    res,
                    403,
                    "Forbidden"
                );
            }

            const filePath =
                path.resolve(
                    ROOT_DIR,
                    "." +
                        requestPath
                );

            serveFile(
                req,
                res,
                filePath
            );
        } catch (
            error
        ) {
            console.error(
                error
            );

            logRequest(
                req,
                500
            );

            sendError(
                res,
                500,
                "Internal Server Error"
            );
        }
    }
);


/* ==========================================================
Start Server
========================================================== */

server.listen(
PORT,
() => {
console.log(

);


    console.log(
        "================================="
    );

    console.log(
        `ShopEase V2 Server Running`
    );

    console.log(
        `URL: http://localhost:${PORT}`
    );

    console.log(
        "================================="
    );

    console.log(
        ``
    );
}


);

/* ==========================================================
Graceful Shutdown
========================================================== */

process.on(
"SIGINT",
() => {
console.log(
"\nShutting down..."
);


    server.close(() => {
        process.exit(
            0
        );
    });
}


);

process.on(
"SIGTERM",
() => {
server.close(() => {
process.exit(
0
);
});
}
);
