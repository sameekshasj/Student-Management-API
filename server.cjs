const http = require('http');
const url = require('url');

let students = [];

// Helper: Send JSON response
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// Helper: Validate student
function validateStudent(data) {
    const { name, email, course, year } = data;

    if (!name || !email || !course || !year) {
        return "All fields are required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Invalid email format";
    }

    if (year < 1 || year > 4) {
        return "Year must be between 1 and 4";
    }

    return null;
}

// Create server
const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // ROUTE: GET /students
    if (path === '/students' && method === 'GET') {
        return sendResponse(res, 200, { success: true, data: students });
    }

    // ROUTE: POST /students
    if (path === '/students' && method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const data = JSON.parse(body);

            const error = validateStudent(data);
            if (error) {
                return sendResponse(res, 400, { success: false, message: error });
            }

            const newStudent = {
                id: Date.now().toString(),
                ...data
            };

            students.push(newStudent);

            return sendResponse(res, 201, { success: true, data: newStudent });
        });

        return;
    }

    // ROUTE: GET /students/:id
    if (path.startsWith('/students/') && method === 'GET') {
        const id = path.split('/')[2];

        const student = students.find(s => s.id === id);

        if (!student) {
            return sendResponse(res, 404, { success: false, message: "Student not found" });
        }

        return sendResponse(res, 200, { success: true, data: student });
    }

    // ROUTE: PUT /students/:id
    if (path.startsWith('/students/') && method === 'PUT') {
        const id = path.split('/')[2];
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const data = JSON.parse(body);

            const error = validateStudent(data);
            if (error) {
                return sendResponse(res, 400, { success: false, message: error });
            }

            const index = students.findIndex(s => s.id === id);

            if (index === -1) {
                return sendResponse(res, 404, { success: false, message: "Student not found" });
            }

            students[index] = { id, ...data };

            return sendResponse(res, 200, { success: true, data: students[index] });
        });

        return;
    }

    // ROUTE: DELETE /students/:id
    if (path.startsWith('/students/') && method === 'DELETE') {
        const id = path.split('/')[2];

        const index = students.findIndex(s => s.id === id);

        if (index === -1) {
            return sendResponse(res, 404, { success: false, message: "Student not found" });
        }

        const deleted = students.splice(index, 1);

        return sendResponse(res, 200, { success: true, data: deleted[0] });
    }

    // 404 Route
    sendResponse(res, 404, {
        success: false,
        message: "Route not found"
    });
});
// Start server
server.listen(3000, () => {
    console.log('Server running on port 3000');
});
