module.exports = `
auto  dsl-provider
iface  dsl-provider  inet  ppp
pre-up  /bin/ip  link  set  eth0  up
provider  dsl-provider
`
