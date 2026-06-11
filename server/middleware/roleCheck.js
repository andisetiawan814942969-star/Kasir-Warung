const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Tidak terautentikasi' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki izin untuk mengakses resource ini' 
      });
    }

    next();
  };
};

module.exports = { roleCheck };
