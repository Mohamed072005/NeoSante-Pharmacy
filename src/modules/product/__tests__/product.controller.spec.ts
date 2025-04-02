import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../product.controller';
import { ProductServiceInterface } from '../interfaces/product.service.interface';
import { ProductRepositoryInterface } from '../interfaces/product.repository.interface';
import { S3Service } from '../../../core/services/s3.service';
import { HttpStatus } from '@nestjs/common';
import { ProductDto } from '../DTOs/product.dto';
import { GetProductParamDto } from '../DTOs/get-product-param.dto';
import {JwtHelper} from "../../../core/helpers/jwt.helper";

describe('ProductController', () => {
    let controller: ProductController;
    let mockProductService: Partial<ProductServiceInterface>;
    let mockProductRepository: Partial<ProductRepositoryInterface>;
    let mockS3Service: Partial<S3Service>;
    let mockJwtHelper: Partial<JwtHelper>;
    let userRepository: any;

    beforeEach(async () => {
        mockProductService = {
            handleCreateProduct: jest.fn(),
            handleGetPharmacyProducts: jest.fn(),
            handleUpdateProduct: jest.fn(),
        };

        userRepository = {
            getUserByEmailOrPhoneNumberOrCINNumber: jest.fn(),
            createUser: jest.fn(),
            getUserById: jest.fn(),
            findUserByEmail: jest.fn(),
        };

        mockProductRepository = {
            getPharmacyProductById: jest.fn(),
            fetchProducts: jest.fn(),
        };

        mockS3Service = {
            uploadFile: jest.fn(),
        };

        mockJwtHelper = {
            VerifyJWTToken: jest.fn(),
            generateJWTToken: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductController],
            providers: [
                {
                    provide: 'ProductServiceInterface',
                    useValue: mockProductService,
                },
                {
                    provide: 'ProductRepositoryInterface',
                    useValue: mockProductRepository,
                },
                {
                    provide: S3Service,
                    useValue: mockS3Service,
                },
                {
                    provide: JwtHelper,
                    useValue: mockJwtHelper
                },
                {
                    provide: 'UserRepositoryInterface',
                    useValue: userRepository,
                },
            ],
        }).compile();

        controller = module.get<ProductController>(ProductController);
    });

    describe('createProduct', () => {
        it('should create a product successfully', async () => {
            const productDto: ProductDto = {
                name: 'Test Product',
                description: 'Test Description',
                pharmacyId: '60d5ecb8b3b3a3001f3e2d2a',
                stock: 10,
                barcode: '123456789012',
                category: '60d5ecb8b3b3a3001f3e2d2b',
                requiresPrescription: 'false',
            };

            const mockFile = {
                originalname: 'test-image.jpg',
                buffer: Buffer.from('test'),
            } as Express.Multer.File;

            const mockUploadResponse = 'https://s3.amazonaws.com/test-image.jpg';

            (mockS3Service.uploadFile as jest.Mock).mockResolvedValue(mockUploadResponse);
            (mockProductService.handleCreateProduct as jest.Mock).mockResolvedValue({
                message: 'Product created successfully',
            });

            const result = await controller.createProduct(
                { image: [mockFile] },
                productDto
            );

            expect(mockS3Service.uploadFile).toHaveBeenCalled();
            expect(mockProductService.handleCreateProduct).toHaveBeenCalledWith({
                ...productDto,
                image: mockUploadResponse,
            });
            expect(result).toEqual({
                message: 'Product created successfully',
                statusCode: HttpStatus.OK,
            });
        });
    });

    describe('getPharmacyProducts', () => {
        it('should retrieve pharmacy products', async () => {
            const mockUserId = '60d5ecb8b3b3a3001f3e2d2a';
            const mockProducts = [
                {
                    _id: '60d5ecb8b3b3a3001f3e2d2b',
                    name: 'Test Product'
                }
            ];

            (mockProductService.handleGetPharmacyProducts as jest.Mock).mockResolvedValue({
                products: mockProducts,
            });

            const result = await controller.getPharmacyProducts({ user_id: mockUserId });

            expect(mockProductService.handleGetPharmacyProducts).toHaveBeenCalledWith(mockUserId);
            expect(result).toEqual({
                statusCode: HttpStatus.OK,
                products: mockProducts,
            });
        });
    });

    describe('getPharmacyProductById', () => {
        it('should retrieve a specific pharmacy product', async () => {
            const mockProductId = '60d5ecb8b3b3a3001f3e2d2b';
            const mockProduct = {
                _id: mockProductId,
                name: 'Test Product'
            };

            const params: GetProductParamDto = { product_id: mockProductId };

            (mockProductRepository.getPharmacyProductById as jest.Mock).mockResolvedValue(mockProduct);

            const result = await controller.getPharmacyProductById(params);

            expect(mockProductRepository.getPharmacyProductById).toHaveBeenCalled();
            expect(result).toEqual({
                statusCode: HttpStatus.OK,
                product: mockProduct,
            });
        });
    });

    describe('updatePharmacyProduct', () => {
        it('should update a pharmacy product', async () => {
            const productDto: ProductDto = {
                name: 'Updated Product',
                description: 'Updated Description',
                pharmacyId: '60d5ecb8b3b3a3001f3e2d2a',
                stock: 15,
                barcode: '123456789012',
                category: '60d5ecb8b3b3a3001f3e2d2b',
                requiresPrescription: 'false',
            };

            const mockFile = {
                originalname: 'updated-image.jpg',
                buffer: Buffer.from('test'),
            } as Express.Multer.File;

            const mockProductId = '60d5ecb8b3b3a3001f3e2d2b';
            const mockUploadResponse = 'https://s3.amazonaws.com/updated-image.jpg';

            (mockS3Service.uploadFile as jest.Mock).mockResolvedValue(mockUploadResponse);
            (mockProductService.handleUpdateProduct as jest.Mock).mockResolvedValue({
                product: { ...productDto, image: mockUploadResponse },
                message: 'Product updated successfully',
            });

            const result = await controller.updatePharmacyProduct(
                { image: [mockFile] },
                productDto,
                { product_id: mockProductId }
            );

            expect(mockS3Service.uploadFile).toHaveBeenCalled();
            expect(mockProductService.handleUpdateProduct).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...productDto,
                    image: mockUploadResponse,
                }),
                mockProductId
            );
            expect(result).toEqual({
                statusCode: HttpStatus.ACCEPTED,
                product: expect.objectContaining(productDto),
                message: 'Product updated successfully',
            });
        });
    });

    describe('getProductsForClients', () => {
        it('should retrieve products for clients with default pagination', async () => {
            const mockProducts = [
                {
                    _id: '60d5ecb8b3b3a3001f3e2d2b',
                    name: 'Test Product'
                }
            ];

            (mockProductRepository.fetchProducts as jest.Mock).mockResolvedValue(mockProducts);

            const result = await controller.getProductsForClients();

            expect(mockProductRepository.fetchProducts).toHaveBeenCalledWith(1, 10, undefined, undefined, undefined, undefined);
            expect(result).toEqual({
                statusCode: HttpStatus.OK,
                products: mockProducts,
            });
        });

        it('should retrieve products with custom filters', async () => {
            const mockProducts = [
                {
                    _id: '60d5ecb8b3b3a3001f3e2d2b',
                    name: 'Test Product'
                }
            ];

            (mockProductRepository.fetchProducts as jest.Mock).mockResolvedValue(mockProducts);

            const result = await controller.getProductsForClients(
                2, 5, 'test', 'category', 'true', 'false'
            );

            expect(mockProductRepository.fetchProducts).toHaveBeenCalledWith(
                2, 5, 'test', 'category', true, false
            );
            expect(result).toEqual({
                statusCode: HttpStatus.OK,
                products: mockProducts,
            });
        });
    });
});