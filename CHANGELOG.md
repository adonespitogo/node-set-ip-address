v1.2.2
---
  - (Fix up) `helpers/trim_ip_address.js` return empty string if undefined IP

v1.2.1
---
  - Don't run restart networking service commands in parallel

v1.2.0
---
  - Now uses `routes` instead of the deprecated `gateway4` for the default gateway. Fixes #33

v1.1.1
---
  - Accept `nameservers` option format in string separated by comma or space

v1.1.0
---
  - Add support for PPPoE interface

v1.0.10
---
  - Added `dns-nameservers` option to interfaces.d

v1.0.9
---
  - Added configuration for the loopback interface in `/etc/network/interfaces`
  - Support for netplan `optional` param

v1.0.4-8
---
  - Support for bridge `stp` option
  - Use netmask instead of network prefix in /etc/network/interfaces

v1.0.3
---
  - Update package dependencies and fix vulnerabilites with `npm audit fix`

v1.0.2
---
  - Allow interface hotplug

v1.0.1
---
  - Fix error when vlan ifname > 15 characters

v1.0.0
---
  - Support for bridge interfaces
  - Improve interoperability with [Windows Server](https://netplan.io/examples#integration-with-a-windows-dhcp-server)
  - Breaking changes:
    * Interface configs are no longer saved in individual files under `/etc/network/interfaces.d/`. Instead, they are now written in `/etc/network/interfaces` file.

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
