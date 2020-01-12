'use strict'

var sinon = require('sinon')
var proxyquire = require('proxyquire')
var { expect } = require('chai')

describe('index.js', () => {

  var set_ip_address,
    dhcpcd,
    interfaces_d,
    netplan,
    exec,
    exec_cbs

  beforeEach(() => {

    dhcpcd = {configure: sinon.fake.resolves()}
    interfaces_d = {configure: sinon.fake.resolves()}
    netplan = {configure: sinon.fake.resolves()}
    exec_cbs = []
    exec = sinon.fake((cmd, cb) => {
      exec_cbs.push(cb)
    })

    set_ip_address = proxyquire('../src/index.js', {
      './dhcpcd/index.js': dhcpcd,
      './interfaces.d/index.js': interfaces_d,
      './netplan/index.js': netplan,
      'child_process' : { exec }
    })
  })

  describe('index.js', () => {
    it('should equal src/index.js', () => {
      var index_src = require('../src/index.js')
      var index = require('../index.js')
      expect(index_src).to.eql(index)
    })
  })

  describe('configure()', () => {

    var restart_stub
    var restart_result
    beforeEach(() => {
      restart_result = 'ok'
      restart_stub = sinon.stub(set_ip_address, 'restartService').resolves(restart_result)
    })

    afterEach(() => {
      restart_stub.restore()
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
      sinon.assert.notCalled(restart_stub)
      sinon.assert.callOrder(dhcpcd.configure, interfaces_d.configure, netplan.configure)
    })

    it('should reject if one interface contains same vlan id', async () => {
      var configs = [
        {interface: 'eth0'},
        {interface: 'eth0', vlanid: 10},
        {interface: 'eth1'},
        {interface: 'eth0', vlanid: 10},
      ]
      try {
        await set_ip_address.configure(configs)
        expect.fail()
      } catch(e) {
        expect(e.message).to.equal("Can't have same VLAN ID on interface eth0")
        sinon.assert.notCalled(dhcpcd.configure)
        sinon.assert.notCalled(interfaces_d.configure)
        sinon.assert.notCalled(netplan.configure)
        sinon.assert.notCalled(restart_stub)
      }
    })

    it('should call .configure for all modules for all (dhcpcd, interfaces.d and netplan)', async () => {
      var eth0 = {interface: 'eth0', ip_address: '10.0.0.1'}
      var eth1 = {interface: 'eth1', ip_address: '10.0.0.1'}
      var configs = [eth0, eth1]
      await set_ip_address.configure(configs)
      sinon.assert.calledWithExactly(dhcpcd.configure, configs)
      sinon.assert.calledWithExactly(interfaces_d.configure, configs)
      sinon.assert.calledWithExactly(netplan.configure, configs)
      sinon.assert.callOrder(dhcpcd.configure, interfaces_d.configure, netplan.configure)
      sinon.assert.notCalled(restart_stub)
    })

    it('should accept single config object', async () => {
      var eth0 = {interface: 'eth0', ip_address: '10.0.0.1'}
      var configs = [eth0]
      await set_ip_address.configure(eth0)
      sinon.assert.calledWithExactly(dhcpcd.configure, configs)
      sinon.assert.calledWithExactly(interfaces_d.configure, configs)
      sinon.assert.calledWithExactly(netplan.configure, configs)
      sinon.assert.callOrder(dhcpcd.configure, interfaces_d.configure, netplan.configure)
      sinon.assert.notCalled(restart_stub)
    })

  })

  describe('restartService()', () => {

    it('should resolve if one service is ok', (done) => {
      var error = 'some error'
      set_ip_address.restartService()
        .then(() => {
          expect(exec.firstCall.args[0]).to.equal('service networking restart')
          expect(exec.secondCall.args[0]).to.equal('netplan try')
          expect(exec.thirdCall.args[0]).to.equal('netplan apply')
        })
        .then(() => done())
        .catch(e => done(e))
      exec_cbs.forEach((cb, i) => {
        if (i == 0)
          cb(error)
        else
          cb()
      })
      // netplan apply cb
      setTimeout(() => {
        exec_cbs[2]()
      })
    })

    it('should reject if all service failed', (done) => {
      var error = 'some error'
      set_ip_address.restartService()
        .then(() => done())
        .catch(e => {
          expect(e).to.equal(error)
          done()
        })
      exec_cbs.forEach((cb, i) => {
        cb(error)
      })
    })

  })

})
