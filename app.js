//jshint esversion:6
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://username:password@host:port/database?options...', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const app = express();
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set("view engine", "ejs");

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("server started at port 3000");
});

const itemSchema = {
  name: String
};
const Item = new mongoose.model("item", itemSchema);
const items = [{
  name: "Welcome to Todolist"
}, {
  name: "Hit + button to add your task."
}, {
  name: "<-- Hit this button to delete task"
}];
const listSchema = {
  name : String,
  listarray : [itemSchema]
};
const List = new mongoose.model("list",listSchema);

app.get("/", (req, res) => {
  // var value = new Date();
  // var options = {
  //   weekday: "long",
  //   day: "numeric",
  //   month: "long"
  // };
  //
  // var v = value.toLocaleDateString("en-US", options);
  var v = "Today";
  Item.find({}, function(err, arr) {
    if (err) {
      console.log(err);
    } else {
      if (arr.length == 0) {
        Item.insertMany(items, (err) => {
          if (err) {
            console.log(err);
          }
        });
        res.redirect("/");
      }else{
      res.render("index", {
        kindOfDay: v,
        itemlist: arr
      });
    }
  }
  });
});

app.post("/", (req, res) => {
  const item = req.body.newtext;
  const listname = req.body.button;
  const newitem = new Item({
    name: item
  });
  console.log(req.body.button);
  if(listname!= "Today"){
    List.findOne({name : listname},(err,mylist)=>{
      if(!err){
        mylist.listarray.push(newitem);
        mylist.save();
        res.redirect("/" + listname);
      }
    });

  }else{
    newitem.save();
    res.redirect("/");
  }

});

app.get("/:customlist",(req,res)=>{
  const customlist = req.params.customlist;
  List.findOne({name : customlist},(err,mylist)=>{
    if(!err){
      if(!mylist){
        const list = new List({
          name : customlist,
          listarray : items
        });
        list.save();
        res.redirect("/" + customlist);
      }else{
        res.render("index",{kindOfDay : mylist.name , itemlist : mylist.listarray});
      }
    }
  });
});

app.post("/delete",(req,res)=>{
  const id = req.body.checkbox;
  const listname = req.body.checkbox1;
  if(listname != "Today"){
    List.findOneAndUpdate({name : listname},{$pull : {listarray : {_id : id}}},(err,mylist)=>{
      if(err){
        console.log(err);
      }
    });
    res.redirect("/" +listname);
  }
  else{
  Item.findByIdAndDelete(id,(err)=>{
    if(err) console.log(err);
  });
  res.redirect("/");
}
});
