'use strict'

var { expect } = require('chai')
var trim_ip_address = require('../../src/helpers/trim_ip_address.js')

describe('helperes/trim_ip_address.js', () => {
  it('should return ip address', () => {
    expect(trim_ip_address(' 10.0.0.1')).to.eql('10.0.0.1')
    expect(trim_ip_address(' 10.0.0.1x')).to.eql('10.0.0.1')
    expect(trim_ip_address('x10.0.0.1x')).to.eql('10.0.0.1')
  })
  it ('should return blank if ip is undefined', () => {
    expect(trim_ip_address(undefined)).to.eql('')
  })
})
