import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
  doctorId: String,
  doctorName: String,
  specialty: String,
  date: String,
  time: String,
  status: { type: String, default: 'confirmed' },
  createdAt: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
  title: String,
  type: String,
  fileName: String,
  uploadedAt: { type: Date, default: Date.now },
  summary: String,
  findings: [String],
  abnormalValues: [String],
  rawText: String,
  status: { type: String, default: 'analyzed' }
});

const symptomCheckSchema = new mongoose.Schema({
  symptoms: [String],
  duration: String,
  severity: String,
  medicalHistory: [String],
  allergies: [String],
  medications: [String],
  result: Object,
  checkedAt: { type: Date, default: Date.now }
});

const profileSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  birthDate: String,
  gender: String,
  bloodGroup: String,
  emergencyContact: String,
  insuranceProvider: String,
  insuranceNumber: String,
  preferredHospital: String,
  medicalConditions: [String],
  allergies: [String],
  medications: [String],
  familyHistory: [String]
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'doctor', 'admin'], default: 'user' },
  profile: { type: profileSchema, default: {} },
  reports: { type: [reportSchema], default: [] },
  appointments: { type: [appointmentSchema], default: [] },
  notifications: { type: [notificationSchema], default: [] },
  history: { type: [symptomCheckSchema], default: [] },
  resetToken: String,
  resetTokenExpires: Date
}, { timestamps: true });

const MongooseUserModel = mongoose.model('User', userSchema);

// --- MOCK DATABASE SYSTEM FOR LOCAL FALLBACK ---
const DB_FILE = path.resolve(process.cwd(), 'src/data/users_db.json');

const ensureDbFile = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
  }
};

const readUsers = () => {
  try {
    ensureDbFile();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading JSON DB, returning empty array:', err);
    return [];
  }
};

const writeUsers = (users) => {
  try {
    ensureDbFile();
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing JSON DB:', err);
  }
};

// Rich default user for seeding
const getDemoUser = async () => {
  const passwordHash = await bcrypt.hash('password123', 10);
  return {
    _id: 'demo-user-id',
    name: 'Jane Doe',
    email: 'demo@vitalis.com',
    passwordHash: passwordHash,
    role: 'user',
    profile: {
      fullName: 'Jane Doe',
      phone: '+1 (555) 019-2834',
      birthDate: '1990-05-15',
      gender: 'female',
      bloodGroup: 'O+',
      emergencyContact: 'John Doe (+1 555-019-5678)',
      insuranceProvider: 'Blue Cross Shield',
      insuranceNumber: 'BCS-99210-A',
      preferredHospital: 'City General Hospital',
      medicalConditions: ['Mild Asthma'],
      allergies: ['Penicillin', 'Peanuts'],
      medications: ['Albuterol inhaler (as needed)'],
      familyHistory: ['Type 2 Diabetes (Maternal grandfather)']
    },
    reports: [
      {
        _id: 'report-1',
        title: 'Blood Test Analysis',
        type: 'Blood Test',
        fileName: 'blood_panel_july_2026.pdf',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'The blood test shows a healthy hematological profile, with a mild rise in cholesterol that can be managed with diet and follow-up testing.',
        findings: [
          'Hemoglobin is within normal limits.',
          'Cholesterol is mildly elevated and should be monitored.',
          'Blood glucose is stable for the current profile.'
        ],
        abnormalValues: ['Total cholesterol'],
        rawText: 'Total cholesterol: 240 mg/dL (High). Hemoglobin: 14.1 g/dL (Normal). Glucose: 92 mg/dL (Normal).',
        status: 'analyzed'
      },
      {
        _id: 'report-2',
        title: 'CBC Analysis',
        type: 'CBC',
        fileName: 'cbc_report_march_2026.pdf',
        uploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'CBC metrics appear balanced. There are no urgent abnormalities in the complete blood count.',
        findings: [
          'White blood cell count is normal.',
          'Red blood cell count is healthy.',
          'Platelet count is within expected range.'
        ],
        abnormalValues: [],
        rawText: 'WBC: 6.5 x10^3/uL. RBC: 4.8 x10^6/uL. Platelets: 250 x10^3/uL.',
        status: 'analyzed'
      }
    ],
    appointments: [
      {
        _id: 'appt-1',
        doctorId: 'doc-1',
        doctorName: 'Dr. Sarah Jenkins',
        specialty: 'Cardiologist',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:30 AM',
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }
    ],
    notifications: [
      {
        _id: 'notif-1',
        message: 'Your symptom check is complete. Review the results on your dashboard.',
        type: 'health',
        read: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'notif-2',
        message: 'Your report analysis is ready in Health History.',
        type: 'report',
        read: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'notif-3',
        message: 'Appointment booked with Dr. Sarah Jenkins on ' + new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' at 10:30 AM.',
        type: 'appointment',
        read: false,
        createdAt: new Date().toISOString()
      }
    ],
    history: [
      {
        _id: 'hist-1',
        symptoms: ['cough', 'fever', 'sore throat'],
        duration: '1-3 days',
        severity: 'moderate',
        medicalHistory: ['Mild Asthma'],
        allergies: ['Penicillin'],
        medications: ['Albuterol'],
        result: {
          possibleConditions: ['Viral infection', 'Upper respiratory infection'],
          confidence: '76%',
          severityLevel: 'moderate',
          suggestedSpecialist: 'General Physician',
          nextSteps: [
            'Keep a symptom journal and note any changes over the next 24–48 hours.',
            'Stay hydrated and rest when possible.',
            'Contact your primary care provider if symptoms worsen or last longer than expected.'
          ],
          emergencyWarning: null,
          disclaimer: 'This assessment is informational only and is not a substitute for professional medical advice.'
        },
        checkedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  };
};

const seedDefaultUser = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  const demoData = await getDemoUser();

  if (isConnected) {
    try {
      const count = await MongooseUserModel.countDocuments({ email: 'demo@vitalis.com' });
      if (count === 0) {
        await MongooseUserModel.create(demoData);
        console.log('Successfully seeded MongoDB with default demo user data.');
      }
    } catch (err) {
      console.warn('Error checking/seeding MongoDB:', err.message);
    }
  } else {
    // Local JSON seeding
    const users = readUsers();
    if (!users.some(u => u.email.toLowerCase() === 'demo@vitalis.com')) {
      users.push(demoData);
      writeUsers(users);
      console.log('Successfully seeded JSON DB with default demo user data.');
    }
  }
};

const wrapUserDocument = (user) => {
  if (!user) return null;
  const doc = JSON.parse(JSON.stringify(user));

  const arrayFields = ['reports', 'appointments', 'notifications', 'history'];
  arrayFields.forEach(field => {
    if (!Array.isArray(doc[field])) {
      doc[field] = [];
    }
    // Add custom mongoose-like array id helper
    Object.defineProperty(doc[field], 'id', {
      value: function(id) {
        return this.find(item => item._id === id || item.id === id);
      },
      enumerable: false,
      writable: true,
      configurable: true
    });
  });

  Object.defineProperty(doc, 'save', {
    value: async function() {
      const isConnected = mongoose.connection.readyState === 1;
      if (isConnected) {
        // If we were using Mongoose but somehow ended up here, update MongoDB
        const dbDoc = await MongooseUserModel.findById(this._id);
        if (dbDoc) {
          Object.assign(dbDoc, this);
          await dbDoc.save();
        }
        return this;
      }

      // JSON DB Save
      const arrayFields = ['reports', 'appointments', 'notifications', 'history'];
      arrayFields.forEach(field => {
        if (Array.isArray(this[field])) {
          this[field].forEach(item => {
            if (!item._id) {
              item._id = field.substring(0, 4) + '-' + Math.random().toString(36).substring(2, 9);
            }
          });
        }
      });

      const users = readUsers();
      const index = users.findIndex(u => u._id === this._id);
      if (index !== -1) {
        users[index] = { ...this };
      } else {
        users.push({ ...this });
      }
      writeUsers(users);
      return this;
    },
    enumerable: false,
    writable: true,
    configurable: true
  });

  return doc;
};

const MockUser = {
  findOne: async (query) => {
    const users = readUsers();
    let matched = null;

    if (query.email) {
      matched = users.find(u => u.email.toLowerCase() === query.email.toLowerCase());
    } else if (query.resetToken) {
      matched = users.find(
        u => u.resetToken === query.resetToken && new Date(u.resetTokenExpires) > new Date()
      );
    }
    return wrapUserDocument(matched);
  },

  findById: async (id) => {
    const users = readUsers();
    const matched = users.find(u => u._id === id);
    return wrapUserDocument(matched);
  },

  create: async (data) => {
    const users = readUsers();
    const newUser = {
      _id: 'user-' + Math.random().toString(36).substring(2, 9),
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role || 'user',
      profile: {},
      reports: [],
      appointments: [],
      notifications: [],
      history: []
    };
    users.push(newUser);
    writeUsers(users);
    return wrapUserDocument(newUser);
  }
};

// Check if mongoose is connected
const isMongooseConnected = () => mongoose.connection.readyState === 1;

// Dynamic wrapper using ES Proxy
const UserWrapper = new Proxy(MongooseUserModel, {
  get(target, prop) {
    if (!isMongooseConnected()) {
      if (prop in MockUser) {
        return MockUser[prop];
      }
    }
    return Reflect.get(target, prop);
  }
});

// Run seeding immediately and also listen for mongoose connection to seed it too
seedDefaultUser().catch(err => console.error('Seeding error on startup:', err));
mongoose.connection.on('connected', () => {
  seedDefaultUser().catch(err => console.error('Seeding error on MongoDB connected:', err));
});

export default UserWrapper;
