"use strict";

var { expect } = require("chai");

describe("netplan", () => {
  var templates, defaults;

  beforeEach(() => {
    templates = require("../../src/netplan/config.js");

    defaults = {
      network: {
        version: 2,
        renderer: "networkd",
        ethernets: {},
      },
    };
  });

  it("it should generate config for single interface with no gateway", () => {
    var config = {
      interface: "eth0",
      ip_address: "10.0.0.1 ",
      prefix: 20,
      nameservers: ["10.0.0.1"],
      optional: true,
      match: {
        macaddress: "xxx",
      },
    };
    var expected_ethernets = {
      eth0: {
        dhcp4: false,
        dhcp6: false,
        addresses: ["10.0.0.1/20"],
        nameservers: {
          addresses: config.nameservers,
        },
        optional: true,
        match: {
          macaddress: "xxx",
        },
      },
    };
    expect(templates.generate(defaults, config).network.ethernets).to.eql(
      expected_ethernets,
    );
  });

  it("it should generate config for single interface with multiple dns separated by space", () => {
    var config = {
      interface: "eth0",
      ip_address: " 10.0.0.1",
      prefix: 20,
      nameservers: " 10.0.0.1 8.8.8.8 ",
      optional: true,
    };
    var expected_ethernets = {
      eth0: {
        dhcp4: false,
        dhcp6: false,
        addresses: ["10.0.0.1/20"],
        nameservers: {
          addresses: ["10.0.0.1", "8.8.8.8"],
        },
        optional: true,
      },
    };
    expect(templates.generate(defaults, config).network.ethernets).to.eql(
      expected_ethernets,
    );
  });

  it("it should generate config for single interface with multiple dns in array", () => {
    var config = {
      interface: "eth0",
      ip_address: "10.0.0.1",
      prefix: 20,
      nameservers: [" 10.0.0.1 8.8.8.8 "],
      optional: true,
    };
    var expected_ethernets = {
      eth0: {
        dhcp4: false,
        dhcp6: false,
        addresses: ["10.0.0.1/20"],
        nameservers: {
          addresses: ["10.0.0.1", "8.8.8.8"],
        },
        optional: true,
      },
    };
    expect(templates.generate(defaults, config).network.ethernets).to.eql(
      expected_ethernets,
    );
  });

  it("it should generate config for 2nd interface with gateway", () => {
    var eth0 = {
      dhcp4: false,
      dhcp6: false,
      addresses: ["10.0.0.1/20"],
      nameservers: {
        addresses: ["10.0.0.1"],
      },
    };

    defaults.network.ethernets.eth0 = eth0;

    var eth1_config = {
      interface: "eth1",
      ip_address: "10.0.0.1",
      prefix: 20,
      nameservers: ["10.0.0.1"],
      gateway: "10.0.0.1 ",
      optional: true,
    };

    var expected_ethernets = {
      eth0: { ...eth0 },
      eth1: {
        dhcp4: false,
        dhcp6: false,
        addresses: ["10.0.0.1/20"],
        routes: [{ to: "default", via: eth1_config.gateway }],
        nameservers: {
          addresses: eth1_config.nameservers,
        },
        optional: true,
      },
    };
    expect(templates.generate(defaults, eth1_config).network.ethernets).to.eql(
      expected_ethernets,
    );
  });

  it("it should generate config for 2nd interface with multiple dns separated by comma", () => {
    var eth0 = {
      dhcp4: false,
      dhcp6: false,
      addresses: ["10.0.0.1/20"],
      nameservers: {
        addresses: ["10.0.0.1"],
      },
    };
    var eth1_config = {
      interface: "eth1",
      ip_address: "10.0.0.1",
      prefix: 20,
      nameservers: "10.0.0.1, 8.8.8.8",
      gateway: "10.0.0.1",
      optional: true,
    };

    defaults.network.ethernets.eth0 = eth0;

    var expected_ethernets = {
      eth0: { ...eth0 },
      eth1: {
        dhcp4: false,
        dhcp6: false,
        addresses: ["10.0.0.1/20"],
        routes: [{ to: "default", via: eth1_config.gateway }],
        nameservers: {
          addresses: ["10.0.0.1", "8.8.8.8"],
        },
        optional: true,
      },
    };
    expect(templates.generate(defaults, eth1_config).network.ethernets).to.eql(
      expected_ethernets,
    );
  });

  it("it should set interface to dynmic ip", () => {
    var config = {
      interface: "eth1",
      dhcp: true,
      optional: true,
    };

    var expected_ethernets = {
      eth1: {
        dhcp4: true,
        dhcp6: true,
        optional: true,
        "dhcp-identifier": "mac",
      },
    };
    expect(templates.generate(defaults, config).network.ethernets).to.eql(
      expected_ethernets,
    );
  });

  describe("VLAN support", () => {
    it("should create vlan with dynamic address", () => {
      var config = {
        ifname: "eth0.0",
        interface: "eth0",
        vlanid: 0,
        dhcp: true,
        optional: true,
      };
      var expected_vlans = {
        "eth0.0": {
          id: 0,
          link: "eth0",
          dhcp4: true,
          dhcp6: true,
          optional: true,
          "dhcp-identifier": "mac",
        },
      };
      expect(templates.generate(defaults, config).network.vlans).to.eql(
        expected_vlans,
      );
    });

    it("should create vlan interface with no gateway and nameservers", () => {
      var config = {
        ifname: "eth0.0",
        interface: "eth0",
        vlanid: 0,
        ip_address: "20.0.0.1",
        prefix: 20,
      };
      var expected_vlans = {
        "eth0.0": {
          id: 0,
          link: "eth0",
          dhcp4: false,
          dhcp6: false,
          addresses: ["20.0.0.1/20"],
        },
      };
      expect(templates.generate(defaults, config).network.vlans).to.eql(
        expected_vlans,
      );
    });

    it("should create vlan interface with gateway and no nameservers", () => {
      var config = {
        ifname: "eth0.10",
        interface: "eth0",
        vlanid: 10,
        ip_address: "20.0.0.1",
        prefix: 20,
        gateway: "20.0.0.1",
      };
      var expected_vlans = {
        "eth0.10": {
          id: 10,
          link: "eth0",
          dhcp4: false,
          dhcp6: false,
          addresses: ["20.0.0.1/20"],
          routes: [{ to: "default", via: "20.0.0.1" }],
        },
      };
      expect(templates.generate(defaults, config).network.vlans).to.eql(
        expected_vlans,
      );
    });

    it("should create vlan interface with gateway nameservers", () => {
      var config = {
        ifname: "eth0.x",
        interface: "eth0",
        vlanid: 10,
        ip_address: "20.0.0.1",
        prefix: 20,
        gateway: "20.0.0.1",
        nameservers: ["1.1.1.1"],
      };
      var expected_vlans = {
        "eth0.x": {
          id: 10,
          link: "eth0",
          dhcp4: false,
          dhcp6: false,
          addresses: ["20.0.0.1/20"],
          routes: [{ to: "default", via: "20.0.0.1" }],
          nameservers: {
            addresses: ["1.1.1.1"],
          },
        },
      };
      expect(templates.generate(defaults, config).network.vlans).to.eql(
        expected_vlans,
      );
    });

    it("should create vlan interface with default options", () => {
      var config = {
        ifname: "eth0.0",
        interface: "eth0",
        vlanid: 0,
        optional: true,
        dhcp: false,
      };
      var expected_vlans = {
        "eth0.0": {
          id: 0,
          link: "eth0",
          dhcp4: false,
          dhcp6: false,
          optional: true,
        },
      };
      expect(templates.generate(defaults, config).network.vlans).to.eql(
        expected_vlans,
      );
    });
  });

  describe("bridged support", () => {
    it("should create bridge interfaces", () => {
      var config = {
        interface: "br0",
        ip_address: "20.0.0.1",
        prefix: 20,
        gateway: "20.0.0.1",
        bridge_ports: ["eth0"],
        bridge_opts: { parameters: { stp: true } },
        optional: true,
      };
      var expected_bridges = {
        br0: {
          dhcp4: false,
          dhcp6: false,
          addresses: ["20.0.0.1/20"],
          routes: [{ to: "default", via: "20.0.0.1" }],
          interfaces: ["eth0"],
          parameters: {
            stp: true,
          },
          optional: true,
        },
      };
      var res = templates.generate(defaults, config);
      expect(res.network.ethernets).to.eql({
        eth0: { dhcp4: false, dhcp6: false, optional: true },
      });
      expect(res.network.bridges).to.eql(expected_bridges);
    });

    it("should create bridge interfaces with ethernets", () => {
      var config = {
        interface: "br0",
        ip_address: "20.0.0.1",
        prefix: 20,
        gateway: "20.0.0.1",
        bridge_ports: ["eth0"],
        bridge_opts: {
          parameters: { stp: false, forward_delay: 0 },
        },
      };
      defaults.network.ethernets = {
        eth0: {
          dhcp4: true,
          match: {
            macaddress: "xxx",
          },
        },
      };
      var expected_bridges = {
        br0: {
          dhcp4: false,
          dhcp6: false,
          addresses: ["20.0.0.1/20"],
          routes: [{ to: "default", via: "20.0.0.1" }],
          interfaces: ["eth0"],
          parameters: { stp: false, forward_delay: 0 },
        },
      };
      var res = templates.generate(defaults, config);

      // expect(res.network.ethernets.eth0).to.be.undefined;
      expect(res.network.ethernets["eth0"]).to.eql({
        dhcp4: false,
        dhcp6: false,
        optional: true,
        match: {
          macaddress: "xxx",
        },
      });
      expect(res.network.bridges).to.eql(expected_bridges);
    });

    it("should create bridge interfaces with vlan", () => {
      var config = {
        interface: "br0",
        ip_address: "20.0.0.1",
        prefix: 20,
        gateway: "20.0.0.1",
        bridge_ports: ["eth0.10"],
        bridge_opts: {
          parameters: { stp: false, forward_delay: 0 },
        },
      };
      defaults.network.vlans = {
        "eth0.10": {
          id: 10,
          link: "eth0",
          dhcp4: true,
        },
      };
      var expected_bridges = {
        br0: {
          dhcp4: false,
          dhcp6: false,
          addresses: ["20.0.0.1/20"],
          routes: [{ to: "default", via: "20.0.0.1" }],
          interfaces: ["eth0.10"],
          parameters: { stp: false, forward_delay: 0 },
        },
      };
      var res = templates.generate(defaults, config);

      expect(res.network.ethernets.eth0).to.be.undefined;
      expect(res.network.vlans["eth0.10"]).to.eql({
        id: 10,
        link: "eth0",
        dhcp4: false,
        dhcp6: false,
        optional: true,
      });
      expect(res.network.bridges).to.eql(expected_bridges);
    });
  });

  describe("ppp exclusion", () => {
    it("should not add ppp interface to ethernets", () => {
      var config = {
        physical_interface: "eth1",
        provider: "dsl-provider",
        ppp: true,
      };
      expect(templates.generate(defaults, config).network.ethernets).to.empty;
    });
  });
});
