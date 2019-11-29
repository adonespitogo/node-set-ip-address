'use strict'

var { expect } = require('chai')
var templates = require('../../src/interfaces.d/templates.js')
var sinon = require('sinon')

describe('interfaces.d/templates.js', () => {

  describe('staticFormat()', () => {

    it('should generate static config string without gateway', () => {
      var config = {
        interface: 'eth0',
        ip_address: '10.0.0.1',
        prefix: 20
      }
      var expected_output = require('./templates/static_ip_wo_gateway.js')
      expect(templates.staticFormat(config)).to.equal(expected_output.trim())
    })

    it('should generate static config string with gateway', () => {
      var config = {
        interface: 'eth0',
        ip_address: '10.0.0.1',
        prefix: 20,
        gateway: '10.0.0.1'
      }
      var expected_output = require('./templates/static_ip_with_gateway.js')
      expect(templates.staticFormat(config)).to.equal(expected_output.trim())
    })

    describe('vlan', () => {
      it('should generate static config string without gateway', () => {
        var config = {
          interface: 'eth0',
          ip_address: '10.0.0.1',
          vlanid: 10,
          prefix: 20
        }
        var expected_output = require('./templates/vlan_static_ip_wo_gateway.js')
        expect(templates.staticFormat(config)).to.equal(expected_output.trim())
      })
      it('should generate static config string with gateway', () => {
        var config = {
          interface: 'eth0',
          ip_address: '10.0.0.1',
          prefix: 20,
          vlanid: 10,
          gateway: '10.0.0.1'
        }
        var expected_output = require('./templates/vlan_static_ip_with_gateway.js')
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
          interface: 'eth0',
          dhcp: true,
          vlanid: 10
        }
        var expected_output = require('./templates/vlan_dhcp_format.js')
        expect(templates.dhcpFormat(config)).to.equal(expected_output.trim())
      })
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

  })

})
