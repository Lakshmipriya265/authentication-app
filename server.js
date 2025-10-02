const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(bodyParser.json());
const SECRET = "mysecret"; 
let users = [];
let forms = [];
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }
   users.push({ id: users.length + 1, name, email, password });
   res.json({ message: "User registered successfully" });
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  if (password !== user.password) {
    return res.status(401).json({ message: "Invalid password" });
  }
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
});
function authenticate(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token provided" });
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.userId = decoded.id; 
    next();
  });
}
app.post("/submit", authenticate, (req, res) => {
  const { title, description } = req.body;
  const form = {
    id: forms.length + 1,
    title,
    description,
    userId: req.userId
  };
  forms.push(form);
  res.json({ message: "Form submitted successfully", form });
});
app.get("/forms", authenticate, (req, res) => {
  const userForms = forms.filter(f => f.userId === req.userId);
  res.json(userForms);
});
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});