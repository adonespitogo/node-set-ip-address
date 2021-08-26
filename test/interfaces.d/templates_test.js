'use strict'

var { expect } = require('chai')
var templates = require('../../src/interfaces.d/templates.js')
var sinon = require('sinon')

describe('interfaces.d/templates.js', () => {

  describe('staticFormat()', () => {

    it('should generate static config string with gateway', () => {
      var config = {
        interface: 'eth0',
        ip_address: '10.0.0.1',
        prefix: 20,
        gateway: '10.0.0.1',
        nameservers: ['10.0.0.1', '8.8.4.4']
      }
      var expected_output = require('./templates/static_ip_with_gateway.js')
      expect(templates.staticFormat(config)).to.equal(expected_output.trim())
    })

    it('should generate static config string without gateway', () => {
      var config = {
        interface: 'eth0',
        ip_address: '10.0.0.1',
        prefix: 20
      }
      var expected_output = require('./templates/static_ip_wo_gateway.js')
      expect(templates.staticFormat(config)).to.equal(expected_output.trim())
    })

    describe('VLAN support', () => {
      it('should generate static config string with gateway', () => {
        var config = {
          ifname: 'eth0.10',
          interface: 'eth0',
          ip_address: '10.0.0.1',
          prefix: 20,
          vlanid: 10,
          gateway: '10.0.0.1'
        }
        var expected_output = require('./templates/vlan_static_ip_with_gateway.js')
        expect(templates.staticFormat(config)).to.equal(expected_output.trim())
      })
      it('should generate static config string without gateway', () => {
        var config = {
          ifname: 'eth0.0',
          interface: 'eth0',
          ip_address: '10.0.0.1',
          nameservers: ['10.0.0.1', '8.8.4.4'],
          vlanid: 0,
          prefix: 20
        }
        var expected_output = require('./templates/vlan_static_ip_wo_gateway.js')
        expect(templates.staticFormat(config)).to.equal(expected_output.trim())
      })
    })

  })

  describe('dhcpFormat()', () => {
    it('should generate dhcp config string', () => {
      var config = {
        interface: 'eth0',
        dhcp: true
      }
      var expected_output = require('./templates/dhcp_format.js')
      expect(templates.dhcpFormat(config)).to.equal(expected_output.trim())
    })

    describe('vlan', () => {
      it('should generate dhcp config string', () => {
        var config = {
          ifname: 'eth0.0',
          interface: 'eth0',
          dhcp: true,
          vlanid: 0
        }
        var expected_output = require('./templates/vlan_dhcp_format.js')
        expect(templates.dhcpFormat(config)).to.equal(expected_output.trim())
      })
    })
  })

  describe('manualFormat()', () => {
    it('should generate manual config string', () => {
      var config = {
        interface: 'eth0',
        manual: true
      }
      var expected_output = 'iface eth0 inet manual'
      expect(templates.manualFormat(config)).to.equal(expected_output.trim())
    })
    it('should generate manual config string for vlan', () => {
      var config = {
        ifname: 'eth0.10',
        interface: 'eth0',
        vlanid: 10,
        manual: true
      }
      var expected_output = 'iface eth0.10 inet manual\n  vlan-raw-device eth0'
      expect(templates.manualFormat(config)).to.equal(expected_output.trim())
    })

  })

  describe('pppFormat()', () => {
    it('should generate ppp config string', () => {
      var config = {
        provider: 'dsl-provider',
        physical_interface: 'eth0'
      }
      var expected_output = require('./templates/ppp_format.js')
      expect(templates.pppformat(config)).to.equal(expected_output.trim())
    })
  })

  describe('format()', () => {

    it('should call staticFormat()', () => {
      var config = {
        interface: 'eth0',
        ip_address: '10.0.0.1'
      }
      var expected_output = 'some static format'
      var static_stub = sinon.stub(templates, 'staticFormat').returns(expected_output)
      var res = templates.format(config)
      expect(res).to.equal(expected_output)
      sinon.assert.calledWithExactly(static_stub, config)
      static_stub.restore()
    })

    it('should call dhcpFormat()', () => {
      var config = {
        interface: 'eth0',
        dhcp: true
      }
      var expected_output = 'some dhcp format'
      var dhcp_stub = sinon.stub(templates, 'dhcpFormat').returns(expected_output)
      var res = templates.format(config)
      expect(res).to.equal(expected_output)
      sinon.assert.calledWithExactly(dhcp_stub, config)
      dhcp_stub.restore()
    })

    it('should call manualFormat()', () => {
      var config = {
        interface: 'eth0',
        manual: true
      }
      var expected_output = 'some manual format'
      sinon.stub(templates, 'manualFormat').returns(expected_output)
      var res = templates.format(config)
      expect(res).to.equal(expected_output)
      sinon.assert.calledWithExactly(templates.manualFormat, config)
      templates.manualFormat.restore()
    })

    it('should add bridge_ports', () => {
      var config = {
        interface: 'br0',
        dhcp: true,
        bridge_ports: ['eth0', 'eth1']
      }
      var dhcp_str = 'some dhcp config'
      var expected_output = dhcp_str + '\n  bridge_ports eth0 eth1' + '\n  bridge_stp off'
      sinon.stub(templates, 'dhcpFormat').returns(dhcp_str)
      var res = templates.format(config)
      expect(res).to.equal(expected_output)
      sinon.assert.calledWithExactly(templates.dhcpFormat, config)
      templates.dhcpFormat.restore()
    })

    it('should add bridge options', () => {
      var config = {
        interface: 'br0',
        dhcp: true,
        bridge_ports: ['eth0', 'eth1'],
        bridge_opts: {
          stp: true
        }
      }
      var dhcp_str = 'some dhcp config'
      var expected_output = dhcp_str + '\n  bridge_ports eth0 eth1' + '\n  bridge_stp on'
      sinon.stub(templates, 'dhcpFormat').returns(dhcp_str)
      var res = templates.format(config)
      expect(res).to.equal(expected_output)
      sinon.assert.calledWithExactly(templates.dhcpFormat, config)
      templates.dhcpFormat.restore()
    })

  })

})
