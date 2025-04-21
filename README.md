# [EMP_UI](https://emp-webui.web.app/)
> CS326 Final Project
- Daniel Kim, Jason Chew

---
## Description
- TBA

---
## Running Locally
- `git clone` this repository
- `cd frontend`
- `npm install`
- `npm run dev`
  - `npm test` to run tests

---
## Testing
- install `mosquitto-client`
- Example message: (replace `<BROKER>`, `<PASSWORD>`, and `<USERNAME>` with your broker credentials)
  - Note that it should match with [RPi's mqtt broker](https://github.com/CS326MusicPlayer/MusicPlayer/blob/main/sensor/get_environment.py)
```sh
mosquitto_pub -h <BROKER> -P <PASSWORD> -u <USERNAME> -p 8883 -t "emp/environment" -m '{"pid": "0", "precipitation_status": "snow", "sunrise": "07:23", "sunset": "20:14", "timezone": "America/Detroit", "temperature": "25", "light_level": 0.5}'
```   

---
## Assets Credit
- Icons, cursor: created by [Freepik](https://www.freepik.com) - [Flaticon](https://www.flaticon.com/)
- Music: Cobblestone5517
