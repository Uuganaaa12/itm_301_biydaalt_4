const axios = require('axios');

async function getUserInfo(token) {
  const res = await axios.get('https://todu.mn/bs/lms/v1/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

module.exports = { getUserInfo };
