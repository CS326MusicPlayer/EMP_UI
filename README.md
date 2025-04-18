# EMP_UI
> CS326 Final Project
- Daniel Kim, Jason Chew

---
## Description
- TBA

---
## Running Locally
- `git clone` this repository
  - You will need `.env` file under `frontend` directory
- `cd frontend`
- `npm install`
- `npm run dev`
  - `npm test` to run tests
  - `npm run build` to build the project
---
## Deployment
- `cd frontend`
- `npm i`
- `npm run build`
- `firebase deploy`

---
## Testing
- install `mosquitto-client`
- Example message: (replace `<BROKER>`, `<PASSWORD>`, and `<USERNAME>` with your own values)
```sh
mosquitto_pub -h <BROKER> -P <PASSWORD> -u <USERNAME> -p 8883 -t "emp/environment" -m '{"pid": "0", "precipitation_status": "snow", "sunrise": "07:23", "sunset": "20:14", "timezone": "America/Detroit", "temperature": "25", "light_level": 0.5}'
```   

---
## Credit
- Icons: created by [Freepik](https://www.freepik.com) - [Flaticon](https://www.flaticon.com/)
