var express=require("express");
var app=express();
var mongoose=require("mongoose");
var bodyParser=require("body-parser");
var methodOverride=require("method-override");
var sanitizer=require("express-sanitizer");
var port=3000;

// APP CONFIG
mongoose.set('useNewUrlParser',true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect("mongodb://localhost/blog_app");
app.use(bodyParser.urlencoded({extended:true}));
app.use(sanitizer())
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.set("view engine","ejs");

// MONGOOSE CONFIG
var blogApp=mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type:Date,default:Date.now}
});
var Blog=mongoose.model("Blog",blogApp);


//RESTFUL ROUTES
app.get("/",function(req,res){
	res.redirect("/blogs");
});

app.get("/blogs",function(req,res){
	Blog.find({},function(err,blogs){
		if(err) console.log(err);
		else res.render("index",{blogs:blogs});
	})
});

app.get("/blogs/new",function(req,res){
	res.render("new");
});

app.post("/blogs",function(req,res){
	req.body.blog.body=req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog,function(err,newBlog){
		if(err) res.render("new");
		else res.redirect("/blogs");
	});
});

app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err) res.redirect("/blogs");
		else res.render("show",{blog:foundBlog});
	});
});

app.get("/blogs/:id/edit",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err) res.redirect("/blogs");
		else res.render("edit",{blog:foundBlog}); 
	});
});

app.put("/blogs/:id",function(req,res){
	req.body.blog.body=req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,foundBlog){
		if(err) res.redirect("/blogs");
		else res.redirect("/blogs/"+req.params.id);
	});
});

app.delete("/blogs/:id",function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err,foundBlog){
		if(err) res.redirect("/blogs");
		else res.redirect("/blogs");
	})
});


app.listen(port,function(){
	console.log("blogApp has started");
});