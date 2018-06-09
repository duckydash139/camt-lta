import multer from 'multer'
import jimp from 'jimp'
import uuid from 'uuid'

const imageOptions = {
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

const fileOptions = {
  storage: multer.diskStorage({
    destination (req, file, next) {
      next(null, './static/pdf/')
    },
    filename (req, file, next) {
      const extension = file.mimetype.split('/')[1]
      const filename = `${uuid.v4()}.${extension}`
      req.body.file = filename
      next(null, filename)
    }
  }),
  fileFilter (req, file, next) {
    const isPdf = file.mimetype.endsWith('/pdf')
    if (isPdf) {
      next(null, true)
    } else {
      next({message: 'This file is not supported!'}, false)
    }
  }
}

export const uploader = {
  image: multer(imageOptions).single('photo'),
  pdf: multer(fileOptions).single('file'),
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
