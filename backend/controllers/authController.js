import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export const signup= async (req,res)=>{
  try{
  const { name,email,password } = req.body;
  if (!email || !password || !name) return res.status(400).json({message:'Missing fields'});
  if (password.length < 6){
         res.status(400).json({message:"Password must be atleast 6 characters"});
      }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
  }
  const existing = await User.findOne({email});
  if (existing) return res.status(400).json({ message:'Email exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email }});
  }catch (err) {
    console.error('Signup error', err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

 export const login = async (req,res)=>{
  try{
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing email/password' });
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email }});
  }catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};


