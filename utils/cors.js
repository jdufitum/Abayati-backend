exports.corsFunction = (req, res, next) =>{
    const allowedOrigins = ['*'];
    const { origin } = req.headers;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    next();
  }
  
  