import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaginationResponseDTO } from '../../app/dto/pagination-response.dto';
import { PaginationDTO } from '../../app/dto/pagination.dto';
import { Op } from 'sequelize';
import { FileInterface } from '../database/models/file.interface';
import { FilesService } from '../providers/services/files.service';
import { FilesController } from './files.controller';
import { FileSystemService } from '../providers/services/file-system.service';
import { UploadFileDTO } from '../../../dist/file/dto/upload-file.dto';

const filesServiceMock = () => ({
  update: jest.fn(),
  getOne: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn(),
  getAll: jest.fn(),
});

const fileSystemServiceMock = () => ({
  deleteIfExist: jest.fn(),
});

const file: FileInterface = {
  mime: '',
  name: '',
  path: '',
};

const pagination: PaginationResponseDTO = {
  page: 1,
  limit: 10,
  count: 5,
  totalCount: 15,
  rows: [file],
};

describe('FilesController', () => {
  let filesService: FilesService, fileSystemService: FileSystemService, controller: FilesController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: FilesService, useFactory: filesServiceMock },
        { provide: FileSystemService, useFactory: fileSystemServiceMock },
      ],
    }).compile();

    filesService = await module.resolve(FilesService);
    fileSystemService = await module.resolve(FileSystemService);
    controller = new FilesController(fileSystemService, filesService);
  });

  describe('upload', () => {
    const dto = new UploadFileDTO();

    const uploadedFile = {
      path: '/path',
      mimetype: 'application/pdf',
      originalname: 'some.pdf',
    };

    it('throws exception if file was not uploaded', async () => {
      await expect(controller.upload(undefined, dto)).rejects.toThrow(BadRequestException);
    });

    it('uses files service to create new file record', async () => {
      await controller.upload(uploadedFile, dto);

      expect(filesService.create).toHaveBeenCalledWith({
        ...dto,
        path: uploadedFile.path,
        mime: uploadedFile.mimetype,
        name: uploadedFile.originalname,
      });
    });

    it('returns uploaded file', async () => {
      jest.spyOn(filesService, 'getOne').mockResolvedValue(file);

      const result = await controller.upload(uploadedFile, dto);

      expect(result).toEqual(file);
    });
  });

  describe('update', () => {
    const dto = new UploadFileDTO();

    it('throws exception if file not exist', async () => {
      jest.spyOn(filesService, 'getOne').mockResolvedValue(null);

      await expect(controller.update('id', dto)).rejects.toThrow(NotFoundException);
      expect(filesService.getOne).toHaveBeenCalledWith({ id: 'id' });
    });

    it('uses files service to update file', async () => {
      jest.spyOn(filesService, 'getOne').mockResolvedValue(file);

      await controller.update('id', dto);

      expect(filesService.update).toHaveBeenCalledWith(file, dto);
    });

    it('returns updated file', async () => {
      jest.spyOn(filesService, 'getOne').mockResolvedValue(file);
      jest.spyOn(filesService, 'update').mockResolvedValue(file);

      const result = await controller.update('id', dto);

      expect(result).toEqual(file);
    });
  });

  describe('delete', () => {
    it('throws exception if file not exist', async () => {
      await expect(controller.delete('id')).rejects.toThrow(NotFoundException);

      expect(filesService.getOne).toHaveBeenCalledWith({ id: 'id' });
    });

    it('uses files service to destroy file', async () => {
      jest.spyOn(filesService, 'getOne').mockResolvedValue(file);

      await controller.delete('id');

      expect(filesService.destroy).toHaveBeenCalledWith(file);
    });

    it('uses file system service to delete file from storage', async () => {
      jest.spyOn(filesService, 'getOne').mockResolvedValue(file);

      await controller.delete('id');

      expect(fileSystemService.deleteIfExist).toHaveBeenCalledWith(`./${file.path}`);
    });

    it('returns deleted file', async () => {
      jest.spyOn(filesService, 'getOne').mockResolvedValue(file);

      const result = await controller.delete('id');

      expect(result).toEqual(file);
    });
  });

  describe('getOne', () => {
    it('throws exception if file not exist', async () => {
      jest.spyOn(filesService, 'getOne').mockResolvedValue(null);

      await expect(controller.getOne('id')).rejects.toThrow(NotFoundException);
      expect(filesService.getOne).toHaveBeenCalledWith({ id: 'id' });
    });

    it('returns obtained file', async () => {
      jest.spyOn(filesService, 'getOne').mockResolvedValue(file);

      const result = await controller.getOne('id');

      expect(result).toEqual(file);
    });
  });

  describe('getAll', () => {
    const paginationDTO = new PaginationDTO();

    it('uses files service to obtain all paginated pages', async () => {
      jest.spyOn(filesService, 'getAll').mockResolvedValue(pagination);

      await controller.getAll(paginationDTO);

      expect(filesService.getAll).toHaveBeenCalledWith(paginationDTO, undefined);
    });

    it('creates conditions object if search value is not empty', async () => {
      jest.spyOn(filesService, 'getAll').mockResolvedValue(pagination);

      await controller.getAll(paginationDTO, 'search');

      expect(filesService.getAll).toHaveBeenCalledWith(paginationDTO, {
        title: { [Op.like]: `%search%` },
      });
    });

    it('returns obtained files', async () => {
      jest.spyOn(filesService, 'getAll').mockResolvedValue(pagination);

      const result = await controller.getAll(paginationDTO);

      expect(result).toEqual(pagination);
    });
  });

  describe('download', () => {
    const year = '2021';
    const month = '2';
    const day = '26';
    const fileName = 'test.pdf';
    const res = {
      sendFile(file, options) {
        return 'file';
      },
    };
    const path = `files/${year}/${month}/${day}`;

    it('throws exception if file not exist', async () => {
      jest.spyOn(filesService, 'getOne').mockResolvedValue(null);

      await expect(controller.download(year, month, day, fileName, res)).rejects.toThrow(
        NotFoundException,
      );

      expect(filesService.getOne).toHaveBeenCalledWith({ path: `${path}/${fileName}` });
    });

    it('returns obtained file from storage using res param', async () => {
      jest.spyOn(filesService, 'getOne').mockResolvedValue(file);

      const result = await controller.download(year, month, day, fileName, res);

      expect(result).toEqual(res.sendFile('', ''));
    });
  });
});
