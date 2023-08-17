const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-gaurav:test123@datatesting.eyz23qp.mongodb.net/todolistDB");

const todoSchema = new mongoose.Schema({
    name: String
})

const todoItem = new mongoose.model("todoItem", todoSchema);

const item1 = new todoItem({
    name: "Welcome to ToDo List"
})
const item2 = new todoItem({
    name: "+ to create ToDo Item"
})
const item3 = new todoItem({
    name: "check to delete the Todo Item"
})


const today = new Date();
var options = {
    weekday: "long",
    day: "numeric",
    month: "long"                                  //wrote it outside for post rquest to use toDay
}
var toDay = today.toLocaleDateString("en-US", options);

app.get("/", function (req, res) {


    todoItem.find({}).then(function (item) {
        if (item.length == 0) {
            todoItem.insertMany([item1, item2, item3]).then(function () {
                console.log("Successfully Added")
            }).catch(function (err) {
                console.log(err)
            })
            res.redirect("/");
        } else {
            res.render("index", { toDay: toDay, toDo: item });
        }

    }).catch(function (err) {
        console.log(err);
    })

})

app.post("/", function (req, res) {

    const listName = req.body.button;
    var toDo = new todoItem({
        name: req.body.todoItem
    })
    if (listName == toDay) {
        // toDoList.push(toDo);
        // todoItem.insertMany([toDo]).then(function(){
        //     console.log("Successfully added");                   //This is just extra coding
        // }).catch(function(err){
        //     console.log(err);
        // })
        toDo.save();
        res.redirect("/");
    } else {
        // newItem.items.push(req.body.todoItem);

        // newItemArray.push(req.body.todoItem);
        // NewList.findOneAndUpdate({ name: listName }, {$pull : { items: newItemArray }}).catch(function (err) {
        //     console.log(err);
        // })
        NewList.findOne({name: listName}).then(function(found){
            found.items.push(toDo);
            found.save();                             //inserting which i got wrong so many time, like for find we need to pull it into found and then the thing to push must folow the schema of the model
        }).catch(function(err){
            console.log(err);
        })
        res.redirect("/"+listName);
    }

})

app.post("/delete", function (req, res) {
    const deleteElement = req.body.checkbox;
    const listName = req.body.listName;
    if(listName == toDay){
        todoItem.deleteOne({ _id: deleteElement }).then(function () {
            console.log("Deleted the element");
        }).catch(function (err) {
            console.log(err);
        })
        res.redirect("/");
    } else{
        NewList.findOneAndUpdate({name: listName},{$pull: {items: {_id: deleteElement}}}).then(function(){
            res.redirect("/"+listName);
        }).catch(function(err){
            console.log(err);
        })
    }
})

const List = new mongoose.Schema({
    name: String,
    items: [todoSchema]
})


const NewList = new mongoose.model("List", List);
var newItemArray = [item1, item2, item3];

app.get("/:customList", function (req, res) {
    const CustomList = lodash.capitalize(req.params.customList);
    NewList.findOne({ name: CustomList }).then(function (found) {
        if (!found) {
            const newItem = new NewList({
                name: CustomList,
                items: newItemArray
            })
            newItem.save();
            res.redirect("/" + CustomList);                    //if render is outside the else we dont need redirect
        } else {
            // NewList.findOne({name: CustomList}).then(function(CustomList){
            res.render("index", { toDay: found.name, toDo: found.items })
            // }).catch(function(err){
            // console.log(err);
            // })
        }
    }).catch(function (err) {
        console.log(err);
    })
})

app.listen(process.env.PORT || 3000, function () {
    console.log("Hello World working on port 3000");
})