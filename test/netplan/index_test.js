'use strict'

var sinon = require('sinon')
var proxyquire = require('proxyquire')
var { expect } = require('chai')

describe('netplan', () => {

  var netplan,
    cfg_yaml,
    config,
    yaml,
    dump_ouput,
    fs,
    filename

  beforeEach(() => {
    cfg_yaml = 'some config'
    dump_ouput = 'some yaml output'
    yaml = {safeDump: sinon.fake(() => dump_ouput)}
    config = {generate: sinon.fake.returns(cfg_yaml)}
    filename = 'some file'
    fs = {
      readdir: sinon.fake((dir, cb) => cb(null, [filename])),
      writeFile: sinon.fake((file, data, cb) => {
        cb()
      })
    }
    netplan = proxyquire('../../src/netplan/index.js', {
      fs,
      'js-yaml': yaml,
      './config': config
    })
  })

  describe('getYamlFileName()', () => {
    it('should return the yaml file name', async () => {
      var f = await netplan.getYamlFileName()
      expect(fs.readdir.lastCall.args[0]).to.equal('/etc/netplan')
      expect(f).to.equal('/etc/netplan/' + filename)
    })
  })

  describe('setInterface()', () => {

    it('should stack config for single interface', () => {
      var eth0 = {
        interface: 'eth0'
      }
      var arg1 = netplan.cfg_stack
      netplan.setInterface(eth0)
      sinon.assert.calledWithExactly(config.generate, arg1, eth0)
      expect(netplan.cfg_stack).to.eql(cfg_yaml)
    })

  })

  describe('writeConfig()', () => {

    beforeEach(() => {
      sinon.stub(netplan, 'getYamlFileName').returns('/etc/netplan/' + filename)
    })

    afterEach(() => {
      netplan.getYamlFileName.restore()
    })

    it('should write config to /etc/netplan', async () => {
      await netplan.writeConfig()
      sinon.assert.calledWithExactly(yaml.safeDump, netplan.cfg_stack, {noCompatMode: true})
      expect(fs.writeFile.lastCall.args[0]).to.equal('/etc/netplan/' + filename)
      expect(fs.writeFile.lastCall.args[1]).to.equal(dump_ouput)
    })

  })


})
