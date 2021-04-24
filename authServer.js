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

let refreshTokens = [];

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;

    if (refreshToken == null) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken({ name: user.name });
        res.json({ accessToken: accessToken })
    })
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
});

app.post('/login', async (req, res) => {
    // Find the user loggin in
    const user = users.find(user => user.name === req.body.name);
    if (user === null) {
        return res.status(400).send('Cannot find user');
    }

    try {
        // Compares if the sent password hash is the same as the saved hash
        if (await bcrypt.compare(req.body.password, user.password)) {
            // JWT
            const accessToken = generateAccessToken(user);
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
            refreshTokens.push(refreshToken);
            console.log(refreshTokens);

            // Send JWT accessToken
            res.json({ accessToken: accessToken, refreshToken: refreshToken });
        } else {
            res.send('Not allowed');
        }
    } catch {
        res.status(500).send();
    }
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}

app.listen(4000);