# Robotje

## Overview
Robotje broker

### Prerequisitess

##### Install package managers:

Install either homebrew:
```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

or install miniconda:

```
https://docs.conda.io/en/latest/miniconda.html
```
##### Install nodejs:

Install nodejs 

```
brew install node
```

(Or use conda if preferred)

```
conda install -c conda-forge nodejs
```

### Installing  broker

```
cd ~/Desktop
git clone https://github.com/lilcasp/robotje.git
```

Install broker

```
cd broker
npm i mosca mqtt
node broker
```

## Make command file executable

Change paths to your own directory

## Setup IP

```
---> change SERVER ip to static '192.168.0.100'
```

## Setup midi-cues
```
Install IAC driver (allow midi between programs)
> open audio/midi setup
--> hit cmd+2 to open midi studio
--> double click IAC driver
----> checkbox "device is online" ON

> open ableton
--> hit [cmd] + [,]
--> link MIDI tab
--> output: IAC-driver ('output: IAC-besturingsbestand') track ON
--> input: IAC-driver track OFF remote ON
--> midi bus set 'MIDI to' IAC-driver


```

## Requirements
```
Install Miniconda
pip3 install -r requirements.txt
```

## Running the program

Running by bash sh file: 

```
1. doubleclick startbroker.command
2. doubleclick startserver.command
```


