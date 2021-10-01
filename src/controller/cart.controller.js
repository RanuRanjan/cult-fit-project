const express = require("express");
const app = express();
const router = express.Router();

const Cart = require("../models/cart.model");
const User = require("../models/user.models");
const product = require("../models/store.model");

const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");

//for login check
//For authentication process
app.use(
  require("express-session")({
    secret: "Any normal Word",
    resave: false,
    saveUninitialized: false,
  })
);

passport.serializeUser(User.serializeUser()); //session encoding
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());

//Add to cart button and create new cart

router.post("", isLoggedIn, async (req, res) => {
  // const product = req.body;
  const { productId, price, quantity, name, brand, image, discountPrice} =
    req.body;
  // console.log(req.body);

  // const userId = "6154be4984d19270d58df2fb";
  const userId = req.user._id;

  let cart = await Cart.findOne({ userId });

  if (cart) {
    let index = cart.products.findIndex((p) => p.productId == productId);

    if (index > -1) {
      let productItem = cart.products[index];
      productItem.quantity = productItem.quantity + 1;
      cart.products[index] = productItem;
    } else {
      cart.products.push({
        productId,
        quantity,
        price,
        name,
        brand,
        image,
        discountPrice,
      });
    }
    cart = await cart.save();
    return res.redirect("cart/");
  } else {
    const newCart = await Cart.create({
      userId,
      products: [
        { productId, quantity, price, name, brand, image, discountPrice },
      ],
    });
    return res.redirect("cart/");
  }
});

router.get("", isLoggedIn, async (req, res) => {
  const userId = req.user._id;

  const item = await Cart.findOne({ userId: userId })
    .populate("products")
    .populate("userId")
    .lean()
    .exec();
   console.log(item.products);
  return res.render("./cart.ejs", { item });
});

// function loggedIn(req, res, next)  {
//     if(req.user) {
//         console.log("google");
//       next();
//     } else {
//       res.redirect("/");
//     }
//   }

router.patch("", isLoggedIn, async (req, res) => {
  const voucher = await Cart.findOneAndUpdate(req.params._id)
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    console.log(req.user._id);
    return next();
  }
  res.redirect("/");
}

module.exports = router;
