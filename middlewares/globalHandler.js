const globalHandler = (err, req, res, next) => {
  // status: fail/something else
  // stack where the error has ocured
  // message
  const stack = err.stack;
  const message = err.message ? err.message : "something went wrong";
  const status = err.status ? err.status : "failed";
  const statusCode = err.statusCode ? err.statusCode : 500;

  // send response
  res.status(statusCode).json({
    message,
    status,
    stack,
  });
};

module.exports = globalHandler;
