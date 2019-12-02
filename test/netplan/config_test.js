'use strict'

var sinon = require('sinon')
var proxyquire = require('proxyquire')
var { expect } = require('chai')
var fs = require('fs')
var assignDeep = require('assign-deep')
var yaml = require('js-yaml')

describe('netplan', () => {

  var templates,
    defaults

  beforeEach(() => {
    templates = require('../../src/netplan/config.js')

    defaults = {
      network: {
        version: 2,
        renderer: 'networkd',
        ethernets: {}
      }
    }

  })

  it('it should generate config for single interface with no gateway', () => {
    var config = {
      interface: 'eth0',
      ip_address: '10.0.0.1',
      prefix: 20,
      nameservers: ['10.0.0.1']
    }
    var expected_ethernets = {
      eth0: {
        dhcp4: false,
        dhcp6: false,
        addresses: ['10.0.0.1/20'],
        nameservers: {
          addresses: config.nameservers
        }
      }
    }
    expect(templates.generate(defaults, config).network.ethernets).to.eql(expected_ethernets)
  })

  it('it should generate config for 2nd interface with gateway', () => {
    var config = {
      interface: 'eth1',
      ip_address: '10.0.0.1',
      prefix: 20,
      nameservers: ['10.0.0.1'],
      gateway: '10.0.0.1'
    }

    var eth0 = {
      dhcp4: false,
      dhcp6: false,
      addresses: ['10.0.0.1/20'],
      nameservers: {
        addresses: config.nameservers
      }
    }

    defaults.network.ethernets.eth0 = eth0

    var expected_ethernets = {
      eth0,
      eth1: {
        dhcp4: false,
        dhcp6: false,
        addresses: ['10.0.0.1/20'],
        gateway4: config.gateway,
        nameservers: {
          addresses: config.nameservers
        }
      }
    }
    expect(templates.generate(defaults, config).network.ethernets).to.eql(expected_ethernets)
  })

  it('it should set interface to dynmic ip', () => {
    var config = {
      interface: 'eth1',
      dhcp: true
    }

    var expected_ethernets = {
      eth1: {
        dhcp4: true,
      }
    }
    expect(templates.generate(defaults, config).network.ethernets).to.eql(expected_ethernets)
  })

  describe('VLAN support', () => {

    it('should create vlan interface with no gateway and nameservers', () => {
      var config = {
        interface: 'eth0',
        vlanid: 10,
        ip_address: '20.0.0.1',
        prefix: 20
      }
      var expected_vlans = {
        'eth0.10': {
          id: 10,
          link: 'eth0',
          dhcp4: false,
          dhcp6: false,
          addresses: ['20.0.0.1/20']
        }
      }
      expect(templates.generate(defaults, config).network.vlans).to.eql(expected_vlans)
    })

    it('should create vlan interface with gateway and no nameservers', () => {
      var config = {
        interface: 'eth0',
        vlanid: 10,
        ip_address: '20.0.0.1',
        prefix: 20,
        gateway: '20.0.0.1'
      }
      var expected_vlans = {
        'eth0.10': {
          id: 10,
          link: 'eth0',
          dhcp4: false,
          dhcp6: false,
          addresses: ['20.0.0.1/20'],
          gateway4: '20.0.0.1'
        }
      }
      expect(templates.generate(defaults, config).network.vlans).to.eql(expected_vlans)
    })

    it('should create vlan interface with gateway nameservers', () => {
      var config = {
        interface: 'eth0',
        vlanid: 10,
        ip_address: '20.0.0.1',
        prefix: 20,
        gateway: '20.0.0.1',
        nameservers: ['1.1.1.1']
      }
      var expected_vlans = {
        'eth0.10': {
          id: 10,
          link: 'eth0',
          dhcp4: false,
          dhcp6: false,
          addresses: ['20.0.0.1/20'],
          gateway4: '20.0.0.1',
          nameservers: {
            addresses: ['1.1.1.1']
          }
        }
      }
      expect(templates.generate(defaults, config).network.vlans).to.eql(expected_vlans)
    })


  })

})


