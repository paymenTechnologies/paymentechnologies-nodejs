// server.js
import express from 'express'
import routes from './routes.js'

const app = express()

app.get('/', function (req, res) {
    res.send('Hello World!');
 })

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(routes)

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})