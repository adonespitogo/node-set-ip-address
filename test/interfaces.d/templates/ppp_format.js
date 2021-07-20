module.exports = `
auto  ppp0
iface  ppp0  inet  ppp
pre-up  /bin/ip  link  set  eth0  up
provider  ppp0
`
