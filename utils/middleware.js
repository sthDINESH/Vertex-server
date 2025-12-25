const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unkown endpoint' })
}

module.exports = {
  unknownEndpoint,
}