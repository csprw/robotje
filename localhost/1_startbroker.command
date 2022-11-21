#!/bin/bash  


# Conda init in correct shell.

# CD into current dir.
cd "$(dirname "$0")"
cd server/broker
node broker

# Do not close terminal window.
$SHELL
