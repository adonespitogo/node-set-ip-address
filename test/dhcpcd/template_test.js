'use strict'

var sinon = require('sinon')
var { expect } = require('chai')
var templates = require('../../src/dhcpcd/templates.js')

describe('dhcpcd/templates.js', () => {

  describe('generateStatic()', () => {
    it('should generate static config without gateway and dns', () => {
      var config = {
        interface: 'eth0',
        ip_address: '10.0.0.1',
        prefix: 20
      }
      var expected_result = `
interface eth0
static ip_address=10.0.0.1/20

`
      var result = templates.generateStatic(config)
      expect(result).to.equal(expected_result)
    })
    it('should generate static config with gateway and dns', () => {
      var config = {
        interface: 'eth0',
        ip_address: '10.0.0.1',
        prefix: 20,
        gateway: '10.0.0.1',
        nameservers: ['10.0.0.1', '8.8.8.8']
      }
      var expected_result = `
interface eth0
static ip_address=10.0.0.1/20
static routers=10.0.0.1
static domain_name_servers=10.0.0.1 8.8.8.8

`
      var result = templates.generateStatic(config)
      expect(result).to.equal(expected_result)
    })

    it('should generate config with noarp', ()=>{
      var config = {
        interface: 'eth0',
        ip_address: '10.0.0.1',
        prefix: 20,
        gateway: '10.0.0.1',
        nameservers: ['10.0.0.1', '8.8.8.8'],
        noarp: true
      }
      var expected_result = `
interface eth0
static ip_address=10.0.0.1/20
static routers=10.0.0.1
static domain_name_servers=10.0.0.1 8.8.8.8
noarp
`
      var result = templates.generateStatic(config)
      expect(result).to.equal(expected_result)
    })
  })

  describe('generateConfig()', () => {
    it('should generate config', () => {
      var static_output = 'some static output'
      var static_stub = sinon.stub(templates, 'generateStatic').returns(static_output)
      var configs = [
        {
          interface: 'eth0',
          ip_address: '10.0.0.1',
          prefix: 20,
          gateway: '10.0.0.1'
        },
        {
          interface: 'eth1',
          ip_address: '10.0.0.2',
          prefix: 20,
          gateway: '10.0.0.2',
          nameservers: ['8.8.8.8']
        },
        {
          interface: 'eth1',
          vlanid: 0,
          ip_address: '20.0.0.2',
          prefix: 20,
          gateway: '20.0.0.2',
          nameservers: ['8.8.8.8']
        },
        {
          interface: 'wlan0',
          dhcp: true
        }
      ]
      var expected_config = templates.main.trim() + `\n\n${static_output}\n\n${static_output}`
      expect(templates.generateConfig(configs)).to.equal(expected_config)
      static_stub.restore()
    })

    it('should generate config with bridged network', () => {
      var static_output = 'some static output'
      var static_stub = sinon.stub(templates, 'generateStatic').returns(static_output)
      var configs = [
        {
          interface: 'eth0',
          ip_address: '10.0.0.1',
          prefix: 20,
          gateway: '10.0.0.1'
        },
        {
          interface: 'eth1',
          ip_address: '10.0.0.2',
          prefix: 20,
          gateway: '10.0.0.2',
          nameservers: ['8.8.8.8']
        },
        {
          interface: 'eth1',
          vlanid: 0,
          ip_address: '20.0.0.2',
          prefix: 20,
          gateway: '20.0.0.2',
          nameservers: ['8.8.8.8']
        },
        {
          interface: 'br0',
          bridge_ports: ['eth1', 'eth1']
        },
        {
          interface: 'wlan0',
          dhcp: true
        }
      ]
      var expected_config = templates.main.trim() + `\n\n${static_output}\n\ndenyinterfaces eth1`
      var ret = templates.generateConfig(configs)
      expect(ret).to.equal(expected_config)
      sinon.assert.calledOnceWithExactly(templates.generateStatic, configs[0])
      static_stub.restore()
    })

  })

})
