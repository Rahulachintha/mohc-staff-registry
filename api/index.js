/**
 * Vercel Serverless Function API Handler
 * Ministry of Housing, Construction and Water Supply, Sri Lanka
 * Route: /api/*
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// On Vercel, use /tmp for writable storage, fallback to local data/
const DATA_DIR = path.join('/tmp', 'mohc_data');
const DATA_FILE = path.join(DATA_DIR, 'employees.json');
const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'employees.json');
const DEFAULT_DATA_FILE = path.join(process.cwd(), 'data', 'default_employees.json');

// In-memory fallback cache
let memoryEmployees = null;

function initStorage() {
  if (memoryEmployees !== null) return;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {}

  let seed = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      let raw = fs.readFileSync(DATA_FILE, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
      seed = JSON.parse(raw);
    } else if (fs.existsSync(LOCAL_DATA_FILE)) {
      let raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
      seed = JSON.parse(raw);
      try { fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf8'); } catch (e) {}
    } else if (fs.existsSync(DEFAULT_DATA_FILE)) {
      let raw = fs.readFileSync(DEFAULT_DATA_FILE, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
      seed = JSON.parse(raw);
      try { fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf8'); } catch (e) {}
    }
  } catch (err) {
    console.error('Storage init error:', err);
    seed = [];
  }

  memoryEmployees = Array.isArray(seed) ? seed : [];
}

function readEmployees() {
  initStorage();
  try {
    if (fs.existsSync(DATA_FILE)) {
      let raw = fs.readFileSync(DATA_FILE, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryEmployees = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  return memoryEmployees || [];
}

function writeEmployees(data) {
  memoryEmployees = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('Could not write to disk, saved in memory:', err);
    return true;
  }
}

// Regex validations
const NIC_REGEX = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
const LK_PHONE_REGEX = /^07[01245678][0-9]{7}$/;
const LK_EMERGENCY_REGEX = /^(0[1-9][0-9]{8})$/;

function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  if (Array.isArray(val)) val = val.join(', ');
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function parseJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = url.pathname;

  // Handle Admin Login
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const validPins = ['admin123', 'ministry@2026'];
    if (validPins.includes((body.pin || '').trim())) {
      const token = crypto.randomBytes ? crypto.randomBytes(24).toString('hex') : 'token_' + Date.now();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        token,
        user: { name: 'HR Administrative Officer', role: 'Admin' }
      }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Invalid Admin PIN or Password.' }));
    }
  }

  // Get Employees
  if (pathname === '/api/employees' && req.method === 'GET') {
    const employees = readEmployees();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, count: employees.length, data: employees }));
  }

  // Create Employee
  if (pathname === '/api/employees' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const cleanNic = (body.nicNumber || '').trim();
      const employees = readEmployees();

      // Check duplicate NIC
      const existing = employees.find(e => e.nicNumber && e.nicNumber.toLowerCase() === cleanNic.toLowerCase());
      if (existing) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          errors: { nicNumber: 'An employee with this NIC number is already registered.' },
          message: 'Duplicate NIC detected.'
        }));
      }

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const referenceNumber = `MOHC-WS-${new Date().getFullYear()}-${randomSuffix}`;

      const newRecord = {
        id: crypto.randomUUID ? crypto.randomUUID() : `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        referenceNumber,
        fullName: (body.fullName || '').trim(),
        designationGrade: (body.designationGrade || '').trim(),
        nicNumber: cleanNic.toUpperCase(),
        dateOfBirth: body.dateOfBirth,
        dateOfAppointment: body.dateOfAppointment,
        permanentAddress: (body.permanentAddress || '').trim(),
        contactNumber: (body.contactNumber || '').replace(/[\s-]/g, ''),
        dateOfRetirement: body.dateOfRetirement,
        dateOfSalaryIncrement: body.dateOfSalaryIncrement,
        dateReportedToMinistry: body.dateReportedToMinistry,
        willingnessForInternalTransfer: body.willingnessForInternalTransfer === 'Yes' ? 'Yes' : 'No',
        preferredDivisions: body.willingnessForInternalTransfer === 'Yes' ? (Array.isArray(body.preferredDivisions) ? body.preferredDivisions.slice(0, 2) : []) : [],
        emergencyContactNumber: (body.emergencyContactNumber || '').replace(/[\s-]/g, ''),
        dateOfTransfer: '',
        transferredLocation: '',
        transferRefNo: '',
        submissionTimestamp: new Date().toISOString(),
        status: 'Active'
      };

      employees.unshift(newRecord);
      writeEmployees(employees);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'Record lodged successfully.', data: newRecord }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Server error processing submission.' }));
    }
  }

  // Update Employee (PUT /api/employees/:id)
  if (pathname.startsWith('/api/employees/') && req.method === 'PUT') {
    try {
      const id = pathname.replace('/api/employees/', '').trim();
      const body = await parseJsonBody(req);
      const employees = readEmployees();
      const index = employees.findIndex(e => e.id === id);

      if (index === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Record not found.' }));
      }

      const current = employees[index];
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

      employees[index] = updated;
      writeEmployees(employees);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'Record updated.', data: updated }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Update failed.' }));
    }
  }

  // Delete Employee (DELETE /api/employees/:id)
  if (pathname.startsWith('/api/employees/') && req.method === 'DELETE') {
    try {
      const id = pathname.replace('/api/employees/', '').trim();
      let employees = readEmployees();
      const existing = employees.find(e => e.id === id);
      if (!existing) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Record not found.' }));
      }
      employees = employees.filter(e => e.id !== id);
      writeEmployees(employees);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: `Record deleted.` }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Delete failed.' }));
    }
  }

  // Export CSV
  if (pathname === '/api/export/csv' && req.method === 'GET') {
    const employees = readEmployees();
    const headers = [
      'Reference No', 'System ID', 'Full Name', 'Designation & Grade', 'National Identity Card (NIC)',
      'Date of Birth', 'Public Service Appointment Date', 'Date Reported to Ministry', 'Permanent Address',
      'Contact Number', 'Annual Salary Increment Date', 'Retirement Date', 'Willing for Internal Transfer',
      'Preferred Divisions', 'Emergency Contact Number', 'Status', 'Date of Transfer', 'Transferred Location', 'Registration Timestamp'
    ];
    const rows = employees.map(e => [
      escapeCsv(e.referenceNumber || ''), escapeCsv(e.id), escapeCsv(e.fullName), escapeCsv(e.designationGrade),
      escapeCsv(e.nicNumber), escapeCsv(e.dateOfBirth), escapeCsv(e.dateOfAppointment), escapeCsv(e.dateReportedToMinistry),
      escapeCsv(e.permanentAddress), escapeCsv(e.contactNumber), escapeCsv(e.dateOfSalaryIncrement), escapeCsv(e.dateOfRetirement),
      escapeCsv(e.willingnessForInternalTransfer), escapeCsv(e.preferredDivisions), escapeCsv(e.emergencyContactNumber),
      escapeCsv(e.status), escapeCsv(e.dateOfTransfer || 'N/A'), escapeCsv(e.transferredLocation || 'N/A'), escapeCsv(e.submissionTimestamp)
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="MOHC_WS_Employee_Registry_${new Date().toISOString().slice(0, 10)}.csv"`
    });
    return res.end(csvContent);
  }

  // Reset Data
  if (pathname === '/api/reset-data' && req.method === 'POST') {
    let seed = [];
    try {
      if (fs.existsSync(DEFAULT_DATA_FILE)) {
        seed = JSON.parse(fs.readFileSync(DEFAULT_DATA_FILE, 'utf8'));
      }
    } catch (e) {}
    writeEmployees(seed);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, message: 'Database reset.', data: seed }));
  }

  // Default Fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
};

