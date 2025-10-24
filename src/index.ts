import app from "./app";
import { AppDataSource } from "./data-source";

AppDataSource.initialize()
  .then(async () => {
    app.listen(process.env.PORT);

    console.log("Express server has started on port "+ process.env.PORT+". Open http://localhost:3000/api to see results");
  })
  .catch((error) => console.log(error));
