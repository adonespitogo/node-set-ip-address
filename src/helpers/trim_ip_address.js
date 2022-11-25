var r = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g

module.exports = ip => {
  try {
    return ip ? ip.match(r)[0] : ''
  } catch (e) {
    throw new Error('Invalid IP Address: ' + ip)
  }
}
