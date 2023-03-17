#! /usr/bin/env python
# vim: set fenc=utf8 ts=4 sw=4 et :
# apt install -y nmap
# pip install scapy python-nmap pyfunctional
# -------/usr/lib/systemd/system/trunas-scan.service--------
# [Unit]
# Description=scan local network for truenas
# After=docker.service opt-aquar-storages-aquarpool.mount
# 
# [Service]
# Type=simple
# User=root
# ExecStart=python3 /opt/aquar/src/truenasseeker.py
# 
# [Install]
# WantedBy=multi-user.target


from __future__ import absolute_import, division, print_function
import logging
import scapy.config
import scapy.layers.l2
import scapy.route
import math
import os
import getopt
import sys
import shutil
import re
import nmap
from functional import seq

logging.basicConfig(format='%(asctime)s %(levelname)-5s %(message)s', datefmt='%Y-%m-%d %H:%M:%S', level=logging.DEBUG)
logger = logging.getLogger(__name__)
nm = nmap.PortScanner()

def long2net(arg):
    if (arg <= 0 or arg >= 0xFFFFFFFF):
        raise ValueError("illegal netmask value", hex(arg))
    return 32 - int(round(math.log(0xFFFFFFFF - arg, 2)))


def to_CIDR_notation(bytes_network, bytes_netmask):
    network = scapy.utils.ltoa(bytes_network)
    netmask = long2net(bytes_netmask)
    net = "%s/%s" % (network, netmask)
    if netmask < 16:
        logger.warning("%s is too big. skipping" % net)
        return None

    return net


def scan():
    if os.geteuid() != 0:
        print('You need to be root to run this script', file=sys.stderr)
        sys.exit(1)

    for network, netmask, _, interface, address, _ in scapy.config.conf.route.routes:

        # skip loopback network and default gw
        if network == 0 or interface == 'lo' or address == '127.0.0.1' or address == '0.0.0.0':
            continue

        if netmask <= 0 or netmask == 0xFFFFFFFF:
            continue

        # skip docker interface
        if interface.startswith('docker') or interface.startswith('br-') or interface.startswith('tun'):
            logger.warning("Skipping interface '%s'" % interface)
            continue

        net = to_CIDR_notation(network, netmask)

        nfsAddress = None
        if net:
            ipInfo = nm.scan(hosts=net, arguments='-p 22,80,111,139,443,445,8006,8008,8081,8384')
            resList = seq(list(ipInfo['scan'].items())).map(lambda i: (i[0],seq(list(i[1]['tcp'].items())).filter(lambda p: p[1]['state'] == "open").map(lambda pi: pi[0] )))
            for res in resList:
                logger.info("%s: %s" % (res[0],res[1]))
                if 80 in res[1] and 111 in res[1] and 139 in res[1] and 443 in res[1] and 445 in res[1]:
                    nfsAddress = res[0]

        return nfsAddress

def checknfs():
    return os.path.ismount('/opt/aquar/storages/aquarpool')


def updatefstab(nfsAdress):
    shutil.copy('/etc/fstab', '/etc/fstab.bak')
    fstabFile = open("/etc/fstab", "r+")

    configText = fstabFile.read()
    prepart = re.split("##\[aquar config start\]##", configText)[0]
    postpart = re.split("##\[aquar config end\]##", configText)[1]
    nfsConfig = "\n##[aquar config start]##\n %s:/mnt/aquarpool /opt/aquar/storages/aquarpool nfs defaults,_netdev 0 0\n##[aquar config end]##\n" % nfsAdress
    logger.info("new nfs config:")
    logger.info(nfsConfig)
    newConifg = prepart + nfsConfig+ postpart
    logger.info("fstab now is:")
    logger.info(newConifg)

    fstabFile.seek(0)
    fstabFile.write(newConifg)
    fstabFile.truncate()
    fstabFile.close()


if __name__ == "__main__":
    print('truenas seeker starting.')
    if not checknfs(): 
        print('truenas seeker find nfs directory is broken, trying to find truenas in local network.')
        nfsAddress = scan()
        updatefstab(nfsAddress)
        print('truenas seeker updated fstab succesfully.')
        os.system("mount -a")
        print('truenas seeker has remounted fstab.')
    else:
        print('truenas seeker is no need to do anything.')