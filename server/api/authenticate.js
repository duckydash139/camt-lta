import jwt from 'jsonwebtoken'

export const auth = {
  async user (req, res, next) {
    const token = req.headers['token']
    if (token) {
      jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({success: false, message: 'token expired.'})
        } else {
          // if everything is good, save to request for use in other routes
          jwt.decode(token, {complete: true})
          next()
        }
      })
    } else {
      return res.status(403).json({success: false, message: 'No token provided.'})
    }
  },
  async admin (req, res, next) {
    const token = req.headers['token']
    if (token) {
      jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({success: false, message: 'token expired.'})
        } else {
          // if everything is good, save to request for use in other routes
          var localDecoded = jwt.decode(token, {complete: true})
          if (localDecoded.payload.username) {
            next()
          } else {
            return res.status(401).json({success: false, message: 'unauthorized'})
          }
        }
      })
    } else {
      return res.status(403).json({success: false, message: 'No token provided.'})
    }
  }
}
