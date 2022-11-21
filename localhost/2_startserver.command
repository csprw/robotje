#!/bin/bash  


# Conda init in correct shell.
eval "$(command conda 'shell.bash' 'hook' 2> /dev/null)"

# Open server.
# open -a 'Google Chrome' http://localhost:8000/
open -a 'Google Chrome' http://127.0.0.1:8000/


# CD into current dir.
cd "$(dirname "$0")"
cd server
conda deactivate
conda activate isla_v2
python manage.py runserver

# Do not close terminal window.
$SHELL
