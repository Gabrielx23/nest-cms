import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

export const fileDestinationPathBuilder = () => {
  const date = new Date();
  return `./files/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

export const filesConfig = {
  limits: {
    fileSize: parseFloat(process.env.MAX_PRODUCT_IMAGE_SIZE),
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match('text.*|image.*|application.*')) {
      cb(null, true);
    } else {
      cb(new BadRequestException(`Unsupported file type ${extname(file.originalname)}`), false);
    }
  },
  storage: diskStorage({
    destination: fileDestinationPathBuilder(),
    filename: (req, file, cb) => {
      const randomName = randomStringGenerator();
      return cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
};
