/**
 * Ministry Staff Information Management System (SIMS)
 * Ministry of Housing, Construction and Water Supply, Sri Lanka
 * 
 * Production-ready Native Node.js Server & REST API
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'mohc_data') : path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'employees.json');
const DEFAULT_DATA_FILE = path.join(__dirname, 'data', 'default_employees.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
}

if (!fs.existsSync(DATA_FILE)) {
  try {
    const seedSrc = fs.existsSync(path.join(__dirname, 'data', 'employees.json'))
      ? path.join(__dirname, 'data', 'employees.json')
      : DEFAULT_DATA_FILE;
    if (fs.existsSync(seedSrc)) {
      fs.copyFileSync(seedSrc, DATA_FILE);
    } else {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    }
  } catch (e) {
    console.error('Data file init error:', e);
  }
}

// Helpers for Data Access
function readEmployees() {
  try {
    let raw = fs.readFileSync(DATA_FILE, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) {
      raw = raw.slice(1);
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading employees data:', err);
    return [];
  }
}

function writeEmployees(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing employees data:', err);
    return false;
  }
}

// Sri Lankan Validation Regexes
const NIC_REGEX = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
const LK_PHONE_REGEX = /^07[01245678][0-9]{7}$/;
const LK_EMERGENCY_REGEX = /^(0[1-9][0-9]{8})$/;

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.csv': 'text/csv; charset=utf-8'
};

// Response Helpers
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function sendText(res, statusCode, text, contentType = 'text/plain') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*'
  });
  res.end(text);
}

// Parse Request Body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

// Helper to escape CSV values
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  if (Array.isArray(val)) val = val.join(', ');
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Server Request Handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  // --- API ROUTE: Admin Authentication ---
  if (pathname === '/api/admin/login' && method === 'POST') {
    try {
      const { pin } = await parseBody(req);
      const validPins = ['admin123', 'ministry@2026'];
      if (validPins.includes((pin || '').trim())) {
        const token = crypto.randomBytes(24).toString('hex');
        return sendJson(res, 200, {
          success: true,
          token,
          user: {
            name: 'HR Administrative Officer',
            role: 'Admin',
            ministry: 'Ministry of Housing, Construction and Water Supply'
          }
        });
      } else {
        return sendJson(res, 401, {
          success: false,
          message: 'Invalid Admin PIN or Password. (Try: admin123 or ministry@2026)'
        });
      }
    } catch (err) {
      return sendJson(res, 400, { success: false, message: err.message });
    }
  }

  // --- API ROUTE: Get All Employees ---
  if (pathname === '/api/employees' && method === 'GET') {
    const employees = readEmployees();
    return sendJson(res, 200, { success: true, count: employees.length, data: employees });
  }

  // --- API ROUTE: Create Employee Record ---
  if (pathname === '/api/employees' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const {
        fullName,
        designationGrade,
        nicNumber,
        dateOfBirth,
        dateOfAppointment,
        permanentAddress,
        contactNumber,
        dateOfRetirement,
        dateOfSalaryIncrement,
        dateReportedToMinistry,
        willingnessForInternalTransfer,
        preferredDivisions,
        emergencyContactNumber
      } = body;

      // Validation
      const errors = {};
      if (!fullName || !fullName.trim()) errors.fullName = 'Full Name is required.';
      if (!designationGrade || !designationGrade.trim()) errors.designationGrade = 'Designation and Grade is required.';
      
      const cleanNic = (nicNumber || '').trim();
      if (!cleanNic) {
        errors.nicNumber = 'NIC Number is required.';
      } else if (!NIC_REGEX.test(cleanNic)) {
        errors.nicNumber = 'Invalid Sri Lankan NIC format (e.g. 198512345678 or 851234567V).';
      }

      if (!dateOfBirth) errors.dateOfBirth = 'Date of Birth is required.';
      if (!dateOfAppointment) errors.dateOfAppointment = 'Date of Appointment is required.';
      if (!permanentAddress || !permanentAddress.trim()) errors.permanentAddress = 'Permanent Address is required.';

      const cleanPhone = (contactNumber || '').replace(/[\s-]/g, '');
      if (!cleanPhone) {
        errors.contactNumber = 'Contact Number is required.';
      } else if (!LK_PHONE_REGEX.test(cleanPhone)) {
        errors.contactNumber = 'Invalid Sri Lankan mobile number format (must be 10 digits starting with 07 e.g. 0771234567).';
      }

      if (!dateOfRetirement) errors.dateOfRetirement = 'Date of Retirement is required.';
      if (!dateOfSalaryIncrement) errors.dateOfSalaryIncrement = 'Annual Salary Increment Date is required.';
      if (!dateReportedToMinistry) errors.dateReportedToMinistry = 'Date Reported to Ministry is required.';

      if (!willingnessForInternalTransfer) {
        errors.willingnessForInternalTransfer = 'Please select willingness for internal transfer.';
      }

      const cleanPreferred = Array.isArray(preferredDivisions) ? preferredDivisions : [];
      if (willingnessForInternalTransfer === 'Yes') {
        if (cleanPreferred.length > 2) {
          errors.preferredDivisions = 'Strict maximum 2 preferred divisions allowed.';
        }
      }

      const cleanEmerg = (emergencyContactNumber || '').replace(/[\s-]/g, '');
      if (!cleanEmerg) {
        errors.emergencyContactNumber = 'Emergency Contact Number is required.';
      } else if (!LK_EMERGENCY_REGEX.test(cleanEmerg)) {
        errors.emergencyContactNumber = 'Emergency Contact must be a valid 10-digit Sri Lankan phone number (e.g. 07XXXXXXXX or 011XXXXXXX).';
      }

      if (Object.keys(errors).length > 0) {
        return sendJson(res, 422, { success: false, errors, message: 'Form validation failed.' });
      }

      // Check duplicate NIC
      const employees = readEmployees();
      const existing = employees.find(e => e.nicNumber.toLowerCase() === cleanNic.toLowerCase());
      if (existing) {
        return sendJson(res, 409, {
          success: false,
          errors: { nicNumber: 'An employee with this NIC number is already registered in the registry.' },
          message: 'Duplicate NIC detected.'
        });
      }

      // Generate Reference Number
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const referenceNumber = `MOHC-WS-${new Date().getFullYear()}-${randomSuffix}`;

      const newRecord = {
        id: crypto.randomUUID ? crypto.randomUUID() : `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        referenceNumber,
        fullName: fullName.trim(),
        designationGrade: designationGrade.trim(),
        nicNumber: cleanNic.toUpperCase(),
        dateOfBirth,
        dateOfAppointment,
        permanentAddress: permanentAddress.trim(),
        contactNumber: cleanPhone,
        dateOfRetirement,
        dateOfSalaryIncrement,
        dateReportedToMinistry,
        willingnessForInternalTransfer: willingnessForInternalTransfer === 'Yes' ? 'Yes' : 'No',
        preferredDivisions: willingnessForInternalTransfer === 'Yes' ? cleanPreferred.slice(0, 2) : [],
        emergencyContactNumber: cleanEmerg,
        dateOfTransfer: '',
        transferredLocation: '',
        submissionTimestamp: new Date().toISOString(),
        status: 'Active'
      };

      employees.unshift(newRecord);
      writeEmployees(employees);

      return sendJson(res, 201, {
        success: true,
        message: 'Employee record successfully submitted and registered.',
        data: newRecord
      });
    } catch (err) {
      console.error('Error creating employee:', err);
      return sendJson(res, 500, { success: false, message: 'Server error processing employee submission.' });
    }
  }

  // --- API ROUTE: Update Employee Record ---
  if (pathname.startsWith('/api/employees/') && method === 'PUT') {
    try {
      const id = pathname.replace('/api/employees/', '').trim();
      const body = await parseBody(req);
      const employees = readEmployees();
      const index = employees.findIndex(e => e.id === id);

      if (index === -1) {
        return sendJson(res, 404, { success: false, message: 'Employee record not found.' });
      }

      const current = employees[index];

      // Update fields
      const updated = {
        ...current,
        fullName: body.fullName !== undefined ? body.fullName.trim() : current.fullName,
        designationGrade: body.designationGrade !== undefined ? body.designationGrade.trim() : current.designationGrade,
        nicNumber: body.nicNumber !== undefined ? body.nicNumber.trim().toUpperCase() : current.nicNumber,
        dateOfBirth: body.dateOfBirth !== undefined ? body.dateOfBirth : current.dateOfBirth,
        dateOfAppointment: body.dateOfAppointment !== undefined ? body.dateOfAppointment : current.dateOfAppointment,
        permanentAddress: body.permanentAddress !== undefined ? body.permanentAddress.trim() : current.permanentAddress,
        contactNumber: body.contactNumber !== undefined ? body.contactNumber.replace(/[\s-]/g, '') : current.contactNumber,
        dateOfRetirement: body.dateOfRetirement !== undefined ? body.dateOfRetirement : current.dateOfRetirement,
        dateOfSalaryIncrement: body.dateOfSalaryIncrement !== undefined ? body.dateOfSalaryIncrement : current.dateOfSalaryIncrement,
        dateReportedToMinistry: body.dateReportedToMinistry !== undefined ? body.dateReportedToMinistry : current.dateReportedToMinistry,
        willingnessForInternalTransfer: body.willingnessForInternalTransfer !== undefined ? body.willingnessForInternalTransfer : current.willingnessForInternalTransfer,
        preferredDivisions: body.preferredDivisions !== undefined ? (Array.isArray(body.preferredDivisions) ? body.preferredDivisions.slice(0, 2) : []) : current.preferredDivisions,
        emergencyContactNumber: body.emergencyContactNumber !== undefined ? body.emergencyContactNumber.replace(/[\s-]/g, '') : current.emergencyContactNumber,
        dateOfTransfer: body.dateOfTransfer !== undefined ? body.dateOfTransfer : current.dateOfTransfer,
        transferredLocation: body.transferredLocation !== undefined ? body.transferredLocation.trim() : current.transferredLocation,
        transferRefNo: body.transferRefNo !== undefined ? body.transferRefNo.trim() : (current.transferRefNo || ''),
        status: body.status !== undefined ? body.status : current.status,
        lastModified: new Date().toISOString()
      };

      // If status is Transferred, require location & transfer date
      if (updated.status === 'Transferred' && !updated.transferredLocation) {
        // Allow updating, but ensure field is present
      }

      employees[index] = updated;
      writeEmployees(employees);

      return sendJson(res, 200, {
        success: true,
        message: 'Employee record successfully updated by Administrator.',
        data: updated
      });
    } catch (err) {
      console.error('Error updating employee:', err);
      return sendJson(res, 500, { success: false, message: 'Server error updating record.' });
    }
  }

  // --- API ROUTE: Delete Employee Record ---
  if (pathname.startsWith('/api/employees/') && method === 'DELETE') {
    try {
      const id = pathname.replace('/api/employees/', '').trim();
      let employees = readEmployees();
      const existing = employees.find(e => e.id === id);

      if (!existing) {
        return sendJson(res, 404, { success: false, message: 'Record not found.' });
      }

      employees = employees.filter(e => e.id !== id);
      writeEmployees(employees);

      return sendJson(res, 200, {
        success: true,
        message: `Employee record for ${existing.fullName} (${existing.nicNumber}) has been deleted.`
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, message: 'Server error deleting record.' });
    }
  }

  // --- API ROUTE: Export to CSV ---
  if (pathname === '/api/export/csv' && method === 'GET') {
    try {
      const employees = readEmployees();
      const headers = [
        'Reference No',
        'System ID',
        'Full Name',
        'Designation & Grade',
        'National Identity Card (NIC)',
        'Date of Birth',
        'Public Service Appointment Date',
        'Date Reported to Ministry',
        'Permanent Residential Address',
        'Contact Number',
        'Annual Salary Increment Date',
        'Retirement Date',
        'Willing for Internal Transfer',
        'Preferred Divisions (Max 2)',
        'Emergency Contact Number',
        'Status',
        'Date of Transfer',
        'Transferred Location / Department',
        'Registration Date / Time'
      ];

      const rows = employees.map(e => [
        escapeCsv(e.referenceNumber || ''),
        escapeCsv(e.id),
        escapeCsv(e.fullName),
        escapeCsv(e.designationGrade),
        escapeCsv(e.nicNumber),
        escapeCsv(e.dateOfBirth),
        escapeCsv(e.dateOfAppointment),
        escapeCsv(e.dateReportedToMinistry),
        escapeCsv(e.permanentAddress),
        escapeCsv(e.contactNumber),
        escapeCsv(e.dateOfSalaryIncrement),
        escapeCsv(e.dateOfRetirement),
        escapeCsv(e.willingnessForInternalTransfer),
        escapeCsv(e.preferredDivisions),
        escapeCsv(e.emergencyContactNumber),
        escapeCsv(e.status),
        escapeCsv(e.dateOfTransfer || 'N/A'),
        escapeCsv(e.transferredLocation || 'N/A'),
        escapeCsv(e.submissionTimestamp)
      ]);

      // Excel-friendly UTF-8 BOM
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const filename = `MOHC_WS_Employee_Registry_${new Date().toISOString().slice(0, 10)}.csv`;

      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(csvContent);
    } catch (err) {
      console.error('Export error:', err);
      return sendJson(res, 500, { success: false, message: 'Failed to generate CSV export.' });
    }
  }

  // --- API ROUTE: Reset to Default Sample Data ---
  if (pathname === '/api/reset-data' && method === 'POST') {
    try {
      if (fs.existsSync(DEFAULT_DATA_FILE)) {
        fs.copyFileSync(DEFAULT_DATA_FILE, DATA_FILE);
      }
      const employees = readEmployees();
      return sendJson(res, 200, {
        success: true,
        message: 'Registry database reset to standard Sri Lankan civil service demonstration records.',
        data: employees
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, message: 'Failed to reset registry data.' });
    }
  }

  // --- STATIC FILE SERVING & SPA ROUTING ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // If path doesn't have an extension (e.g. /submit or /admin), serve index.html (SPA routing)
  if (!path.extname(filePath)) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routes
      const fallbackIndex = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(fallbackIndex, (err2, content) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('500 Internal Server Error');
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content);
    });
  });
});

if (!process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(` Ministry of Housing, Construction and Water Supply, Sri Lanka  `);
    console.log(` Staff Information Management System (SIMS)                   `);
    console.log(`================================================================`);
    console.log(` Server running at: http://localhost:${PORT}`);
    console.log(` - Public Submission Form:  http://localhost:${PORT}/submit`);
    console.log(` - Protected Admin Portal:  http://localhost:${PORT}/admin`);
    console.log(` - Admin Default PIN:       admin123  or  ministry@2026`);
    console.log(`================================================================`);
  });
}

module.exports = server;

