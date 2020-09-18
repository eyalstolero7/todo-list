//jshint esversion:6

const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

const workItems = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin-eyal:test123@cluster0.br9t4.mongodb.net/<dbname>?retryWrites=true&w=majority/todolistDB", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

const ItemsSchema = new mongoose.Schema({
    name: String,
});

const Item = mongoose.model("Item", ItemsSchema);

const defaultItems = [
    new Item({ name: "Welcome to your todolist!" }),
    new Item({ name: "Hit the + button to add a new item." }),
    new Item({ name: "<-- Hit this to delete an item." }),
];

const listSchema = {
    name: String,
    items: [ItemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
    res.redirect("/home");
});

app.get("/:list", function (req, res) {
    const listName = req.params.list;
    List.findOne({ name: listName }, function (err, docs) {
        if (!docs) {
            const list = new List({
                name: listName,
                items: defaultItems,
            });
            list.save(function (err, product) {
                res.redirect("/" + listName);
            });
        } else {
            const query = List.find({}).select({ name: 1, _id: 0 });
            query.exec(function (err, lists) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(lists);
                    res.render("List", {
                        listTitle: listName,
                        itemsArr: docs.items,
                        listNames: lists,
                        kebabCaseEjs: _.kebabCase,
                        upperFirstOnlyEjs: upperFirstOnly,
                        toUpperEjs: _.upperCase,
                    });
                }
            });
        }
    });
});

app.post("/:list", function (req, res) {
    const listTitle = req.params.list;
    const itemName = req.body.newItem;
    const item = new Item({ name: itemName });
    List.findOne({ name: listTitle }, function (err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listTitle);
    });
});

app.post("/delete/:list", function (req, res) {
    const listTitle = req.params.list;
    const checkedItemId = req.body.checkbox;
    List.findOneAndUpdate(
        { name: listTitle },
        { $pull: { items: { _id: checkedItemId } } },
        function (err, foundList) {
            res.redirect("/" + listTitle);
        }
    );
});

app.post("/add/:list", function (req, res) {
    console.log("here");
    const newListName = req.body.newList;
    console.log(newListName);
    // List.findOne({ name: newListName }, function (err, docs) {
    //     if (!docs) {
    //         const list = new List({
    //             name: listName,
    //             items: defaultItems,
    //         });
    //         list.save(function (err, product) {
    //             res.redirect("/" + listName);
    //         });
    res.redirect("/" + _.kebabCase(newListName));
});

app.listen(3000, function () {
    console.log("Server is running on port 3000.");
});

function upperFirstOnly(string) {
    return _.upperFirst(_.lowerCase(string));
}
