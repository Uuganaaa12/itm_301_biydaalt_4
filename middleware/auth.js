module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // LMS рүү token дамжуулж шалгана
    const axios = require('axios');
    console.log('Token:', token);
    const userRes = await axios.get('https://todu.mn/bs/lms/v1/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    req.user = userRes.data; // LMS-н буцаасан хэрэглэгчийн мэдээлэл
    next();
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
