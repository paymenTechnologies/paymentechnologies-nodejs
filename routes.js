import express from 'express'
import { encryptData } from './encryption.js'

const router = express.Router()

router.post('/encrypt', (req, res) => {
  const { data } = req.body
  const result = encryptData(data)
  // return result;
  res.end(result);
})


export default router