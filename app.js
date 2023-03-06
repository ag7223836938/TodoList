//jshint esversion:6
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://akhil:ag123@cluster0.ynmhit9.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo-list!"
});

const item2 = new Item({
  name: "+ to add new"
});

const item3 = new Item({
  name: "check-box to delete"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function (req, res) {
  Item.find(function (err, rest) {
    if (err) {
      console.log(err);
    } else {
      if (rest.length == 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("items inserted");
          }
        })
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: rest });
      }
    }
  })
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, rest) {
      rest.items.push(item);
      rest.save();
      res.redirect("/" + listName);
    })
  }

  //   if (req.body.list === "Work") {
  //     workItems.push(item);
  //     res.redirect("/work");
  //   } else {
  //     items.push(item);
  //     res.redirect("/");
  //   }
});

app.post("/delete", function (req, res) {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(itemId, function (err) {
      if (!err) {
        console.log("deleted successfully");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}},function(err,rest){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
  })


app.get("/:name", function (req, res) {
  const listName = _.capitalize(req.params.name);

  List.findOne({ name: listName }, function (err, rest) {
    if (!err) {
      if (!rest) {
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save(function(err,rest){
          res.redirect("/" + listName);
        });
        
      } else {
        res.render("list", { listTitle: rest.name, newListItems: rest.items })
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
