const express = require('express');
const bodyParser = require('body-parser');
const handlebars = require("express-handlebars");
const port = 3000;
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); //Remains to be seen if we'll be receiving json
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

require('./routes')(app);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});