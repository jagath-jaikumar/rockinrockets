exports.e404 = function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
}


exports.e500 = function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
}
