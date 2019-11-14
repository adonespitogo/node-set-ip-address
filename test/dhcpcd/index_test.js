'use strict'

var sinon = require('sinon')
var proxyquire = require('proxyquire')
var { expect } = require('chai')

describe('dhcpcd', () => {

  var dhcpcd,
    templates,
    config,
    fs

  beforeEach(() => {
    config = 'some config string'
    templates = {
      generateConfig: sinon.fake.returns(config)
    }
    fs = {
      writeFile: sinon.fake((file, data, cb) => {
        cb()
      })
    }
    dhcpcd = proxyquire('../../src/dhcpcd/index.js', {
      fs,
      './templates.js': templates
    })
  })

  describe('configure()', () => {
    it('should write config', async () => {
      var cfg = 'my config'
      await dhcpcd.configure(cfg)
      sinon.assert.calledWithExactly(templates.generateConfig, cfg)
      expect(fs.writeFile.lastCall.args[0]).to.equal('/etc/dhcpcd.conf')
      expect(fs.writeFile.lastCall.args[1]).to.equal(config)
    })
  })

})
