# iss-gateway
ISS-Gateway for Domoticz is a gateway (really ?!) to display [Domoticz](https://domoticz.com/) devices into [ImperiHome](http://www.evertygo.com/imperihome) mobile interface. It run perfectly on a **Raspberry Pi** with a minimal footprint (approx. 50Mb) and can work in a cluster for performance improvment.

ISS-Gateway is a fork and also a portage from [ISS-Domo](https://github.com/bobinou/iss-domo).

### Todo-list
- [ ] Better manage user configuration (create user config file if not exist)
- [x] Add AUTH Basic security layer on top of ISS-Gateway
- [ ] Better implementation of DevThermostat (actually only Heating Point is functional)
- [ ] Add history system and change graphable attribue to true
- [ ] And so one...

## Installation
[![asciicast](https://asciinema.org/a/41059.png)](https://asciinema.org/a/41059)
Start by installing it using NPM : 
```
$ sudo npm install iss-gateway -g
```

Ensure it's correctly installed : 
```
$ iss-gateway
```

The result must be :
```
pi@raspberrypi:~ $ iss-gateway
------------------------------------------------------------------------------------
ISS-Gateway for Domoticz v0.0.4
Global config file is /usr/lib/node_modules/iss-gateway/config.json
User config must be placed in /etc/iss-gateway.json
Domoticz is configured on http://admin:admin@host_or_ip:8080/json.htm
------------------------------------------------------------------------------------
```
You can stop the process by typing CTRL+C in your console.  

### Create user configuration
Create (only once time) your configuration file by copying it from the global configuration file : 
```
sudo cp /usr/lib/node_modules/iss-gateway/config.json /etc/iss-gateway.json
```
See configuration steps before launching the gateway.

### Launching at startup
The best solution is to use PM2 (The awesome Process Manager for NodeJS processes) :
```
$ sudo npm install pm2 -g
```
*Note that it can be also installed locally without -g option. In this case, config file path could be different depending of your system.*

Then, start iss-gateway on PM2
```
$ pm2 start iss-gateway
```
The result must be :
```
$ pm2 status
┌────────────────────┬────┬──────┬───────┬────────┬─────────┬────────┬─────────────┬──────────┐
│ App name           │ id │ mode │ pid   │ status │ restart │ uptime │ memory      │ watching │
├────────────────────┼────┼──────┼───────┼────────┼─────────┼────────┼─────────────┼──────────┤
│ iss-gateway        │ 0  │ fork │ 30475 │ online │ 0       │ 15m    │ 58.160 MB   │ disabled │
└────────────────────┴────┴──────┴───────┴────────┴─────────┴────────┴─────────────┴──────────┘
```
Generate an init script 
```
$ sudo pm2 startup systemd
```
Is it possible to specify an user by adding -u <username> at the end of the startup command.

## Update an existing installation
If you have already installed a previous version of ISS-Gateway, to update do : 
```
$ sudo npm update iss-gateway -g
```
Then, reload the current running instance :
```
$ pm2 reload iss-gateway
[PM2] Reloading process by name iss-gateway
[PM2][WARN] iss-gateway app can't be reloaded - restarting it
[PM2] restartProcessId process id 0
[PM2] All processes reloaded
```

## Configuration
[TO BE DONE]

See the config.json file below : 
```
{
    "port": 8000,
    "debug": false,
    "auth": null,
    "domoticz": {
        "ssl": false,
        "host": "host_or_ip_of_domoticz",
        "port": 8080,
        "auth": {
            "username": "admin",
            "password": "admin"
        },
        "path": "/",
        "user-agent": "ISS-Gateway",
        "url_cam_video": "video/mjpg.cgi"
    }
}
```

### Add authentication to ISS-Gateway
Set a username/password object to the 'auth' root node and specify an username and an password value: 

```auth: { "username": "admin", "password": "admin" }```

# API and objects definition 
* ImperiHome Standard System API : http://dev.evertygo.com/api/iss
* ISS API Demo : http://dev.evertygo.com/apidoc/iss/demo/devices 
* Domoticz API : https://www.domoticz.com/wiki/Domoticz_API/JSON_URL's

## CHANGELOG
* v0.0.7 - Auth Basic mechanism

#### Author: [Yohann Ciurlik](http://spawnrider.net)
#### License: MIT


