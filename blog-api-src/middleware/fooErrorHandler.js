const errorHandler = async (err, req, res, next) => {
  console.log(err);
  return res.json({ msg: `${err.message}` });
};

export default errorHandler;
