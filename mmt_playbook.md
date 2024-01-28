There are two instances of MMT running on cortana, the buildserver at buildserver.mathhub.info, and the alea backend at stexmmt.mathhub.info. Both are running in tmux sessions, which are stored in files on /srv/tmux-sessions. To get to the ALeA backend, you do tmux -S /srv/tmux-sessions/stexmmt attach -t stexmmt; for the buildserver, analogously tmux -S /srv/tmux-sessions/buildserver attach -t buildserver. In both cases, you'll end up in an mmt shell, which you can close via exit.
To start the buildserver (after closing it), run /srv/buildserver/deploy/mmt --file /srv/builderver/deploy/buildserver.msl.
To start the alea-backend after closing it, run /srv/MMT/stexserver.sh.
i.e. to restart the alea backend in case it hangs you do:

tmux -S /srv/tmux-sessions/stexmmt attach -t stexmmt
exit
/srv/MMT/stexserver.sh
