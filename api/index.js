const express = require('express')
const dbItems = require('../dbItems')
const Auth = require('../authRoutes')
const cors = require('cors')

const app = express()
const PORT = 8000

app.use(cors())

app.use(express.json())

app.use('/users', Auth)

app.get('/', (req, res) => {
    res.send('welcome to crud app')
})

app.listen(PORT, 
    console.log(`Server is running on http://localhost:${PORT}`)
)