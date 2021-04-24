require('dotenv').config();

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Allows application to accept json
app.use(express.json());

const users = [
    {
        name: "Mike",
        password: "$2b$10$TW2MjjwBtgIIpTMTAJoHPuaIIdpRwZvAYxQ0WOPgUTgMaaKmHbkxW" // shit
    },
    {
        name: "Jimmy Fallon",
        password: "$2b$10$i4r/q7EG9plfbikpSEz0QuQZOAXZnGtjCcSodZkAM6uKaWcl7btdm" //IShitTheBed
    },
    {
        name: "Thanos",
        password: "$2b$10$ERNReyDfQmXxYwKRspfROO9FNADvC7PEUP0T4IuoOkdY2s6zi14Rq" // password
    }
];

const posts = [
    {
        name: "Thanos",
        title: "Today I commited genocide"
    },
    {
        name: "Thanos",
        title: "I think I'm about to snap"
    },
    {
        name: "Mike",
        title: "I think I'm about to wap"
    }
]

app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.name === req.user.name));
});

app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/users', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { name: req.body.name, password: hashedPassword };
        users.push(user);
        res.status(201).send();
    } catch {
        res.status(500).send();
    }
});

// Create middleWare
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.send('No token found');

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
    // Bearer TOKEN
}

app.listen(5000);