const express = require('express');
const bodyParser = require('body-parser');
const handlebars = require("express-handlebars");
const port = 3000;
const app = express();

//object represents the arguments packaged up
const hbs = handlebars.create({
    helpers: {
        link: (type, id, text) => {
            return `<a href="/${type}/${id}">${text}</a>`
        }
    },
    defaultLayout: "main",
    extname: ".hbs"
})

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); //Remains to be seen if we'll be receiving json
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

require('./routes')(app);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});