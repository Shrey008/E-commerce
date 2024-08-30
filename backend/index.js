const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer =  require("multer");
const path = require("path");
const cors =  require("cors");
const { request } = require("http");
const { log } = require("console");
const { type } = require("os");

app.use(express.json());
app.use(cors());
// Database connection with mongodb
mongoose.connect("mongodb+srv://vishalkurmi142:vishalkurmi@cluster0.ee8shlf.mongodb.net/e-commerce")
//api creation


//api creation
app.get("/",(req,res)=>{
    res.send("express app is running")
})

//image storage engine
const storage =  multer.diskStorage({
    destination:"./upload/images",
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})


//creating upload endpoint for uploadding images
app.use('/images',express.static('upload/images'))
app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})



// Schema for Creating products 
const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    new_price:{
        type: Number,
        required: true,
    },
    old_price:{
        type: Number,
        required: true,
    },
    date:{
        type: Date,
        default: Date.now,
    },
    available:{
        type: Boolean,
        default: true,
    },
});

// Schema for add product
app.post('/addproduct',async (req,res)=>{
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let lastProductArray = products.slice(-1);
        let lastProduct = lastProductArray[0];
        id = lastProduct.id + 1;
    } else {
        id = 1;
    }


    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved"),
    res.json({
        success:true,
        name:req.body.name,
    })
});


//here we will create api for getting products
app.get('/allproducts',async (req,res)=>{
    let products = await Product.find({});
    console.log("all products fetched");
    res.send(products);
})


 


//creating api for deleting products
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name
    });
});

// Shema creating for user model
const Users = mongoose.model('Users',{
    name:{
        type: 'string',
    },
    email:{
        type: 'string',
        unique: true,
    },

    password:{
        type: 'string',
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default: Date.now
    }
})



// Creating Endpoint for registring the user
app.post('/signup', async (req, res) =>{
    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(200).json({success: false,errors:'existing user found with same email id or email address already'})
    }
    let cart = {};
    for(let i = 0; i<300; i++){
        cart[i] = 0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();
    const data = {
        user:{
            id:user.id
        }
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({success:true, token})
})

// creating endpoint for user login
app.post('/login', async (req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passComare = req.body.password === user.password 
        if(passComare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data, 'secret-ecom');
            res.json({success:true, token});
        }
        else{
            res.json({success:false,errors:"Wrong Password"});
        }

    }
    else{
        res.json({success:false,errors:"Wrong Email Id"});
    }
})

app.get('/newcollections', async (req, res) =>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
     
})


// creating endPoint for popular in women section
app.get('/popularinwomen',async (req, res) =>{
    let products = await Product.find({category:"women"})
    let popular_in_women = products.slice(0,4);
    console.log("popular in women fetched");
    res.send(popular_in_women);
})

// creating middleware to fetch user

const fetchUser = async (req, res,next) => {
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"Please authenticate using valid token"})
    }
    else{
        try{
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user;
            next();
        }
        catch(error){
            res.status(401).send({errors:"Please authenticate using valid token"})

        }

    }

}

//creating endpoint for adding products in cartdata

app.post('/addtocart',fetchUser,async (req, res) => {
    // console.log(req.body, req.user);
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added")
})
app.listen(port,(error)=>{
    if(!error){
        console.log("server running or port "+port)
    }
    else{
        console.log("error :"+error)
    }
});
