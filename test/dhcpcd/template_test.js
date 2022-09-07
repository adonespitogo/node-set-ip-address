'use strict'

var sinon = require('sinon')
var proxyquire = require('proxyquire').noPreserveCache()
var { expect } = require('chai')

describe('dhcpcd/templates.js', () => {

  var templates;

  beforeEach(() => {
    templates = proxyquire('../../src/dhcpcd/templates.js', {})
  })

  describe('generateStatic()', () => {
    it('should generate static config without gateway and dns', () => {
      var config = {
        interface: 'eth0',
        ip_address: '10.0.0.1 ',
        prefix: 20
      }
      var expected_result = `
interface eth0
static ip_address=10.0.0.1/20
`
      var result = templates.generateStatic(config)
      expect(result).to.equal(expected_result)
    })

    it('should generate static config for VLAN', () => {
      var config = {
        interface: 'eth0',
        vlanid: 100,
        ip_address: '10.0.0.1 ',
        prefix: 20
      }
      var expected_result = `
interface eth0.100
static ip_address=10.0.0.1/20
`
      var result = templates.generateStatic(config)
      expect(result).to.equal(expected_result)
    })

    it('should generate static config with gateway and dns', () => {
      var config = {
        interface: 'eth0',
        ip_address: '10.0.0.1.',
        prefix: 20,
        gateway: '10.0.0.1',
        nameservers: ['10.0.0.1 1.1.1.1 ', '8.8.8.8 ']
      }
      var expected_result = `
interface eth0
static ip_address=10.0.0.1/20
static routers=10.0.0.1
static domain_name_servers=10.0.0.1 1.1.1.1 8.8.8.8
`
      var result = templates.generateStatic(config)
      expect(result).to.equal(expected_result)
    })

    it('should generate static config with gateway and dns in string', () => {
      var config = {
        interface: 'eth0',
        ip_address: '10.0.0.1',
        prefix: 20,
        gateway: '10.0.0.1',
        nameservers: '10.0.0.1, 8.8.8.8'
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
    it('should generate config for physical interface (static and dynamic)', () => {
      var static_output = 'some static output '
      templates.generateStatic = sinon.fake(c => static_output + c.interface)
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
          interface: 'wlan0',
          dhcp: true
        }
      ]
      var expected_config = templates.main.trim() + `

${static_output + 'eth0'}

${static_output + 'eth1'}`
      var res = templates.generateConfig(configs)
      expect(res).to.equal(expected_config)
    })

    it('should generate config with bridged network', () => {
      var static_output = 'some static output '
      templates.generateStatic = sinon.fake(c => static_output + c.interface)

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
          ip_address: '10.0.0.2',
          prefix: 20,
          gateway: '10.0.0.2',
          nameservers: ['8.8.8.8']
        },
        {
          interface: 'br0',
          bridge_ports: ['eth0', 'eth1.0'],
          ip_address: '10.0.0.2',
          prefix: 20,
          gateway: '10.0.0.2',
          nameservers: ['8.8.8.8']
        },
        {
          interface: 'wlan0',
          dhcp: true
        }
      ]
      var expected_config = templates.main.trim() + `\n\n${static_output + 'eth1'}\n\n${static_output + 'br0'}\n\ndenyinterfaces eth0 eth1.0`
      var ret = templates.generateConfig(configs)
      expect(ret).to.equal(expected_config)
    })

  })

})
