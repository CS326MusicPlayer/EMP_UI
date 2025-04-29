# [EMP_UI](https://emp-webui.web.app/)
> CS326 Final Project
- Daniel Kim, Jason Chew
- [Set up your Rasberry Pi](https://github.com/CS326MusicPlayer/MusicPlayer)

---
## Description
This project adaptively plays different soundtracks depending on the current state of precipitation, sunrise/sunset times, lighting conditions, and/or temperature, based on a Raspberry Pi’s location. The music plays in a web frontend, through which the user can also specify what environmental factors should play a role in the tracks played.

Our system has two base tracks, one for “daytime” and one for “nighttime.” The base tracks are chosen based on time or light level. Each track has three variations: one for clear weather, one for rainy weather, and one for snowy weather. The variations are chosen based on local weather conditions or temperature.

---
## Diagrams
![Data Flow Diagram](/diagrams/Data%20Flow%20Diagram.png)
![State Diagram](/diagrams/state_diagram.png)


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
mosquitto_pub -h <BROKER> -P <PASSWORD> -u <USERNAME> -p 8883 -t "emp/environment" -m '{"pid": "0", "precipitation_status": "snow", "sunrise": "07:23", "sunset": "20:14", "timezone": "America/Detroit", "temperature": "25", "light_level": 0.5, "timestamp": "129403493423"}'
```

---
## Assets Credit
- **Icons**: [Freepik](https://www.freepik.com), [UniconLabs](http://flaticon.com/authors/uniconlabs) - [Flaticon](https://www.flaticon.com/)
- **Cursor**: [Freepik](https://www.freepik.com) - [Flaticon](https://www.flaticon.com/)
- **Music**: Cobblestone5517
