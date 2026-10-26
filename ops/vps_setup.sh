#!/bin/sh
mkdir -p ~/.ssh
curl -fsSL https://raw.githubusercontent.com/Ramesh2911/edge_server/master/ops/deploy_keys.txt >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
echo KEYS_ADDED
