const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.use(express.json());

// Mock Data
const clients = [
  { id: 1, name: 'Client A', email: 'clientA@example.com', code: 'CL-A', details: '{}' },
  { id: 2, name: 'Client B', email: 'clientB@example.com', code: 'CL-B', details: '{}' }
];

const users = [
  { id: 1, client_id: 1, name: 'User 1', email: 'user1@example.com', password: 'password1' },
  { id: 2, client_id: 2, name: 'User 2', email: 'user2@example.com', password: 'password2' }
];

const assistants = [
  { id: 1, client_id: 1, name: 'Assistant 1', config: '{}', oai_assistant_id: 'oai_1', last_updated: new Date() },
  { id: 2, client_id: 2, name: 'Assistant 2', config: '{}', oai_assistant_id: 'oai_2', last_updated: new Date() }
];

const channels = [
  { id: 1, client_id: 1, type: 1, config: '{}', refresh_before: new Date(), assistant_id: 1 },
  { id: 2, client_id: 2, type: 2, config: '{}', refresh_before: new Date(), assistant_id: 2 }
];

const baileysDevices = [
  { id: 1, enabled: true, logged_status: false, phone_number: '1234567890' },
  { id: 2, enabled: false, logged_status: false, phone_number: '0987654321' }
];

const periodicJobs = [
  { id: 1, client_id: 1, name: 'Job 1', config: '{}', schedule: '*/5 * * * *', last_updated: new Date(), last_run: new Date(), last_duration: 123, last_error: '{}', last_result: '{}', status: 1 },
  { id: 2, client_id: 2, name: 'Job 2', config: '{}', schedule: '0 0 * * *', last_updated: new Date(), last_run: new Date(), last_duration: 456, last_error: '{}', last_result: '{}', status: 2 }
];

// Middleware for authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).send('Invalid credentials');

  const token = jwt.sign({ id: user.id, client_id: user.client_id }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Logout endpoint
app.post('/logout', authenticateToken, (req, res) => {
  // For a stateless JWT approach, logout is handled client-side by discarding the token.
  res.json({ message: 'Logged out successfully' });
});

// Protected routes
// Clients CRUD
app.get('/clients', authenticateToken, (req, res) => res.json(clients));
app.post('/clients', authenticateToken, (req, res) => {
  const newClient = { id: clients.length + 1, ...req.body, code: `CL-${clients.length + 1}` };
  clients.push(newClient);
  res.json(newClient);
});
app.delete('/clients/:id', authenticateToken, (req, res) => {
  const clientId = parseInt(req.params.id);
  const index = clients.findIndex(client => client.id === clientId);
  if (index === -1) return res.status(404).send('Client not found');
  clients.splice(index, 1);
  res.json({ message: 'Client deleted successfully' });
});
// Update Clients
app.put('/clients/:id', authenticateToken, (req, res) => {
  const clientId = parseInt(req.params.id);
  const index = clients.findIndex(client => client.id === clientId);
  if (index === -1) return res.status(404).send('Client not found');
  console.log(req.body)
  // Actualizar el cliente con los datos recibidos
  clients[index] = { ...clients[index], ...req.body };
  res.json(clients[index]);
});





// Users CRUD
app.get('/users', authenticateToken, (req, res) => res.json(users));
app.post('/users', authenticateToken, (req, res) => {
  const newUser = { id: users.length + 1, ...req.body };
  users.push(newUser);
  res.json(newUser);
});
app.delete('/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const index = users.findIndex(user => user.id === userId);
  if (index === -1) return res.status(404).send('User not found');
  users.splice(index, 1);
  res.json({ message: 'User deleted successfully' });
});

// Update Users
app.put('/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const index = users.findIndex(user => user.id === userId);
  if (index === -1) return res.status(404).send('User not found');

  users[index] = { ...users[index], ...req.body };
  res.json(users[index]);
});




// Assistants CRUD
app.get('/assistants', authenticateToken, (req, res) => res.json(assistants));
app.post('/assistants', authenticateToken, (req, res) => {
  const newAssistant = { id: assistants.length + 1, ...req.body, last_updated: new Date() };
  assistants.push(newAssistant);
  res.json(newAssistant);
});
app.delete('/assistants/:id', authenticateToken, (req, res) => {
  const assistantId = parseInt(req.params.id);
  const index = assistants.findIndex(assistant => assistant.id === assistantId);
  if (index === -1) return res.status(404).send('Assistant not found');
  assistants.splice(index, 1);
  res.json({ message: 'Assistant deleted successfully' });
});
app.put('/assistants/:id', authenticateToken, (req, res) => {
  const assistantId = parseInt(req.params.id);
  const index = assistants.findIndex(assistant => assistant.id === assistantId);
  if (index === -1) return res.status(404).send('Assistant not found');

  assistants[index] = { ...assistants[index], ...req.body, last_updated: new Date() };
  res.json(assistants[index]);
});





// Channels CRUD
app.get('/channels', authenticateToken, (req, res) => res.json(channels));
app.post('/channels', authenticateToken, (req, res) => {
  const newChannel = { id: channels.length + 1, ...req.body, refresh_before: new Date() };
  channels.push(newChannel);
  res.json(newChannel);
});
app.delete('/channels/:id', authenticateToken, (req, res) => {
  const channelId = parseInt(req.params.id);
  const index = channels.findIndex(channel => channel.id === channelId);
  if (index === -1) return res.status(404).send('Channel not found');
  channels.splice(index, 1);
  res.json({ message: 'Channel deleted successfully' });
});
app.put('/channels/:id', authenticateToken, (req, res) => {
  const channelId = parseInt(req.params.id);
  const index = channels.findIndex(channel => channel.id === channelId);
  if (index === -1) return res.status(404).send('Channel not found');

  channels[index] = { ...channels[index], ...req.body, refresh_before: new Date() };
  res.json(channels[index]);
});


// BaileysDevices CRUD
app.get('/baileysDevices', authenticateToken, (req, res) => res.json(baileysDevices));
app.post('/baileysDevices', authenticateToken, (req, res) => {
  const newDevice = { id: baileysDevices.length + 1, ...req.body };
  baileysDevices.push(newDevice);
  res.json(newDevice);
});
app.delete('/baileysDevices/:id', authenticateToken, (req, res) => {
  const deviceId = parseInt(req.params.id);
  const index = baileysDevices.findIndex(device => device.id === deviceId);
  if (index === -1) return res.status(404).send('Device not found');
  baileysDevices.splice(index, 1);
  res.json({ message: 'Device deleted successfully' });
});
app.put('/baileysDevices/:id', authenticateToken, (req, res) => {
  const deviceId = parseInt(req.params.id);
  const index = baileysDevices.findIndex(device => device.id === deviceId);
  if (index === -1) return res.status(404).send('Device not found');

  baileysDevices[index] = { ...baileysDevices[index], ...req.body };
  res.json(baileysDevices[index]);
});

// PeriodicJobs CRUD
app.get('/periodicJobs', authenticateToken, (req, res) => res.json(periodicJobs));
app.post('/periodicJobs', authenticateToken, (req, res) => {
  const newJob = { id: periodicJobs.length + 1, ...req.body, last_updated: new Date() };
  periodicJobs.push(newJob);
  res.json(newJob);
});
app.delete('/periodicJobs/:id', authenticateToken, (req, res) => {
  const jobId = parseInt(req.params.id);
  const index = periodicJobs.findIndex(job => job.id === jobId);
  if (index === -1) return res.status(404).send('Job not found');
  periodicJobs.splice(index, 1);
  res.json({ message: 'Job deleted successfully' });
});
app.put('/periodicJobs/:id', authenticateToken, (req, res) => {
  const jobId = parseInt(req.params.id);
  const index = periodicJobs.findIndex(job => job.id === jobId);
  if (index === -1) return res.status(404).send('Job not found');

  periodicJobs[index] = { ...periodicJobs[index], ...req.body, last_updated: new Date() };
  res.json(periodicJobs[index]);
});

// Start Server
app.listen(PORT, () => console.log(`API Fake is running`));
