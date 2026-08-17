const { supabase } = require('../config/db');

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ message: 'Unauthorized', error: error?.message });
    }

    req.user = data.user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Auth middleware error', error: error.message });
  }
};
