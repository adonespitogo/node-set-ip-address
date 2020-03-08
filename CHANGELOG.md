v0.2.1
---
  - Support for bridge interfaces

v0.2.0
---
  - added ./index.js as main file

v0.1.7
---
  - vlan validation - must not have the same vlan id on same interface
  - accept object param for single interface configuration

v0.1.6
---
  - fix extra ip address added to interface when it has vlan

v0.1.5
---
  - optional network restart

v0.1.4
---
  - accept zero vlan tag/id

v0.1.3
---
  - fix netplan vlan config not removed

v0.1.2
---
  - fix netplan vlan feature

v0.1.1
---
  - restart networking service after config change

v0.1.0
---
  - support for vlan interface

Previous Releases
---
  - support for `dhcpcd` (/etc/dhcpcd.conf)
  - support for `ifdownup` (/etc/network/interfaces.d/*)
  - support for `netplan` (/etc/netplan/*)
