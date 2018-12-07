const express = require('express');
const bodyParser = require('body-parser');
const handlebars = require("express-handlebars");
const port = 3000;
const app = express();

const hbs = handlebars.create({
    helpers: {
        link: (type, id, text) => {
            return `<a href="/${type}/${id}">${text}</a>`
        },
        commaSepString: (lst) => {
            return lst.join(', ')
        },
        length: (lst) => {
            return lst.length
        },
        descriptor: (lst, name) => {
            if(lst.length === 1)
                return `${lst.length} ${name}`
            return `${lst.length} ${name}s`
        },
        timeInMinutes: (seconds) => {
            return `${Math.floor(seconds / 60)}:${seconds % 60}`
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