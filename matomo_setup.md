# Matomo Setup Commands
This document describes the steps taken to install matomo on Cortana. The following guides were followed for the setup:

- https://www.cloudbooklet.com/how-to-install-mysql-on-debian-11/
- https://www.vultr.com/docs/install-matomo-on-ubuntu-20-04/

## Setting up SQL server
```
cd ~
wget https://dev.mysql.com/get/mysql-apt-config_0.8.22-1_all.deb
sudo apt install ./mysql-apt-config_0.8.22-1_all.deb
sudo apt update
sudo apt install mysql-server
               password: <Password1>
```
Checked that the SQL status was setup correctly with the following command: 
 ```
 $  sudo service mysql status
  Loaded: loaded (/lib/systemd/system/mysql.service; enabled; vendor preset: enabled)
     Active: active (running) since Sat 2022-10-01 07:53:46 CEST; 12s ago
       Docs: man:mysqld(8)
             http://dev.mysql.com/doc/refman/en/using-systemd.html
   Main PID: 487791 (mysqld)
     Status: "Server is operational"
      Tasks: 39 (limit: 77146)
     Memory: 366.8M
        CPU: 413ms
     CGroup: /system.slice/mysql.service
             └─487791 /usr/sbin/mysqld
Oct 01 07:53:45 cortana systemd[1]: Starting MySQL Community Server...
Oct 01 07:53:46 cortana systemd[1]: Started MySQL Community Server.
```
  
### Setup matomo database on the sql server

```
$ sudo mysql -u root -p

CREATE DATABASE matomo;
CREATE USER 'matomouser'@'localhost' IDENTIFIED BY '<Password2>';
GRANT ALL ON matomo.* TO 'matomouser'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
exit;
```

## matomo.kwarc.info setup
  - Asked Tom to update DNS to point `matomo.kwarc.info` to cortana:443 
  - Note: I wrote file /etc/apache2/sites-available/matomo.voll-ki.fau.de.conf but it doesn't seem to be used. 
  `matomo.kwarc.info` is serving files in the `/var/www/html` directory
  - Got the latest release from https://matomo.org/download/ and moved it to `/var/www/html`
 
## WebUI setup
Once `matomo.kwarc.info` started working I used the SQL information (which was setup above).

Created a superuser with `<Password3>`
