var express          = require("express"),
	expressSanitizer = require("express-sanitizer"),
	methodOverride   = require("method-override"),
	bodyParser       = require("body-parser"),
	mongoose         = require("mongoose"),
	app              = express();

// mongoose is connected and blog_app database is creatd for using in the app
mongoose.connect("mongodb://localhost:27017/blog_app",{ useNewUrlParser: true,useUnifiedTopology: true, useFindAndModify:false});
// setted view engine to ejs
app.set("view engine","ejs");

// use public directory
app.use(express.static("public"));

// use body parser
app.use(bodyParser.urlencoded({extended:true}));

// use express sanitizer
app.use(expressSanitizer());

// use method-override
app.use(methodOverride("_method"));

// mongoose model
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type:Date,default:Date.now}
});

// using blog schema for new blog entries
var Blog = mongoose.model("Blog",blogSchema);
app.get("/",function(req,res){
	res.redirect("/blogs");
});

// home page
app.get("/blogs",function(req,res){
	Blog.find({},function(err,allblogs){
		if(err){
			console.log(err);
		}else{
			res.render("index",{blogs:allblogs});
		}
	});
});

// new template route
app.get("/blogs/new",function(req,res){
	res.render("new");
});
// create route
app.post("/blogs",function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog,function(err,newblog){
		if(err){
			res.redirect("new");
		}else{
			res.redirect("/blogs");
		}
	});
});

// show route
app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show",{blog:foundBlog});
		}
	});
});

// edit route
app.get("/blogs/:id/edit",function(req,res){
	Blog.findById(req.params.id,function(err,selectedblog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit",{blog:selectedblog});
		}
	})
})

// update route
app.put("/blogs/:id",function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedblog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

// delete route
app.delete("/blogs/:id",function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	})
})

app.listen(3000,function(){
	console.log("blog server started at port 3000");
})