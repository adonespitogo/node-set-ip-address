'use strict'

var { expect } = require('chai')
var templates = require('../../src/interfaces.d/templates.js')

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
  })

})
