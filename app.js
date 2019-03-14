//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("Mongoose");
const app = express();
const _ = require("lodash");


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// mongoose.connect("mongodb+srv://admin-dhruvil:dhruvildsa18@cluster0-rssm0.mongodb.net/todolistDB", {
//   useNewUrlParser: true
// });

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
});


const itemsSchema = {
  name: String
};
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemsSchema);

const taskOne = new Item({
  name: "Wake Up!"
});

const taskTwo = new Item({
  name: "Bath"
});

const defualtItems = [taskOne, taskTwo];

app.get("/", function(req, res) {
  Item.find({}, function(err, results) {
    if (results.length === 0) {
      Item.insertMany(defualtItems, function(err) {
        if (err) {
          console.log("Addition failed!");
        } else {
          console.log(defualtItems);
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: results
      });
    }
  });
});

app.get("/:topics", function(req, res) {
  const requestedTitle = _.capitalize(req.params.topics);
  List.findOne({
    name: requestedTitle
  }, function(err, result) {
    if (!err) {
      if (!result) {
        const list = new List({
          name: requestedTitle,
          items: defualtItems
        });
        list.save();
        res.redirect("/" + requestedTitle);
      } else {
        res.render("list", {
          listTitle: result.name,
          newListItems: result.items
        });
      }
    }
  });


});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, result) {
      result.items.push(item);
      result.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem, function(err) {
      if (!err) {
        console.log("Item removed!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItem
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});



// app.get("/about", function(req, res) {
//   res.render("about");
// });
//
// let port = process.env.PORT;
// if (port == null || port == ""){
//   port = 3000;
// }

let port = 3000;

app.listen(port, function() {
  console.log("Server started on port 3000");
});
