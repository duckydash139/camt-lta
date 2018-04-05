import multer from 'multer'
import jimp from 'jimp'
import uuid from 'uuid'

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter (req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/')
    if (isPhoto) {
      next(null, true)
    } else {
      next({message: 'This file is not supported!'}, false)
    }
  }
}

export const uploader = {
  upload: multer(multerOptions).single('photo'),
  async resize (req, res, next) {
    if (!req.file) {
      next()
    }
    const extension = req.file.mimetype.split('/')[1]
    req.body.photo = `${uuid.v4()}.${extension}`
    // resizing
    const photo = await jimp.read(req.file.buffer)
    await photo.resize(800, jimp.AUTO).quality(60)
    await photo.write(`./static/uploads/${req.body.photo}`)
    next()
  }
}
