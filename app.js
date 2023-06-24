//jshint esversion:6

// RXQaenLDQ3gYF

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://"+(process.env.name)+":"+(process.env.password)+"@cluster0.upwjcyv.mongodb.net/ListItem?retryWrites=true&w=majority", {useNewUrlParser: true});
const Item = new mongoose.Schema({name: String});
const Item_mod = mongoose.model("Items", Item);

const item1 = new Item_mod({
  name: "Drinking Milk"
})
const item2 = new Item_mod({
  name: "Drinking Coffee"
})
const item3 = new Item_mod({
  name: "Drinking Tea"
})

// Item_mod.insertMany([item1,item2,item3]).then(()=>{console.log("done")})

const defaultlist = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [Item]
}
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item_mod.find({}).then(result =>{
    res.render("list", {listTitle: "Today", newListItems: result, address: "", addres: ""});
  })
});

app.post("/", function(req, res){

  const item = new Item_mod({name: req.body.newItem});
  item.save().then(()=>{
  res.redirect("/");
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete", (req,res)=>{
  
  const id =req.body.checkbox;
  Item_mod.findByIdAndRemove(id).then(()=>{
    res.redirect("/");
  });
})

app.get("/:topic", function(req,res){
  const customList = _.capitalize(req.params.topic);
  const listt = new List({
    name: customList,
    items: defaultlist
  })
  List.find({name: customList}).then(result=>{
    if(result.length===0){
      listt.save();
      res.render("list", {listTitle: customList+" List", newListItems: defaultlist, address: customList, addres: "/"+customList});
    }else{
      res.render("list", {listTitle: result[0].name+" List", newListItems: result[0].items, address: customList, addres: "/"+customList});
    }
  })
});

app.post("/:topic", (req,res)=>{
  let item5 = new Item_mod({name: req.body.newItem});
  
  List.findOne({name: req.params.topic}).then((result)=>{
    result.items.push(item5);
    result.save();
    res.redirect("/"+req.params.topic);
  })
  
})

app.post("/delete/:topic", (req,res)=>{
  List.findOneAndUpdate(
    {name: req.params.topic},
    {$pull: {items: {_id: req.body.checkbox}}}
  ).then(()=>{
    res.redirect("/"+req.params.topic);
  })
  
})


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
