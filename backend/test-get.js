const jwt = require('jsonwebtoken');
const axios = require('axios');
const token = jwt.sign({sub: 'test', mobile: '+919876543210', role: 'ADMIN'}, process.env.JWT_ACCESS_SECRET || 'CHANGE_ME_256_BIT_RANDOM_STRING_access');
axios.get('http://localhost:4000/api/v1/customers', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => console.log('SUCCESS:', r.data))
.catch(e => console.log('ERROR:', e.response?.status, e.response?.data));
