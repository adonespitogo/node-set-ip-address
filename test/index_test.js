'use strict'

var sinon = require('sinon')
var proxyquire = require('proxyquire')
var { expect } = require('chai')

describe('src/index.js', () => {

  var set_ip_address,
    dhcpcd,
    interfaces_d,
    netplan

  beforeEach(() => {

    dhcpcd = {configure: sinon.fake.resolves()}
    interfaces_d = {configure: sinon.fake.resolves()}
    netplan = {configure: sinon.fake.resolves()}

    set_ip_address = proxyquire('../src/index.js', {
      './dhcpcd/index.js': dhcpcd,
      './interfaces.d/index.js': interfaces_d,
      './netplan/index.js': netplan
    })
  })

  it('should order configs, physical interface first then vlans', async () => {
    var configs = [
      {interface: 'eth0'},
      {interface: 'eth0', vlanid: 10},
      {interface: 'eth1'},
      {interface: 'eth1', vlanid: 10},
    ]
    var expected_configs = [
      {interface: 'eth0'},
      {interface: 'eth1'},
      {interface: 'eth0', vlanid: 10},
      {interface: 'eth1', vlanid: 10},
    ]
    await set_ip_address.configure(configs)
    sinon.assert.calledWithExactly(dhcpcd.configure, expected_configs)
    sinon.assert.calledWithExactly(interfaces_d.configure, expected_configs)
    sinon.assert.calledWithExactly(netplan.configure, expected_configs)

  })

  it('should call .configure for all modules for all (dhcpcd, interfaces.d and netplan)', async () => {
    var eth0 = {interface: 'eth0', ip_address: '10.0.0.1'}
    var eth1 = {interface: 'eth1', ip_address: '10.0.0.1'}
    var configs = [eth0, eth1]
    await set_ip_address.configure(configs)
    sinon.assert.calledWithExactly(dhcpcd.configure, configs)
    sinon.assert.calledWithExactly(interfaces_d.configure, configs)
    sinon.assert.calledWithExactly(netplan.configure, configs)
  })

})
