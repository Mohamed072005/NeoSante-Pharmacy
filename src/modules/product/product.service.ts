import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ProductServiceInterface } from "./interfaces/product.service.interface";
import { ProductDto } from "./DTOs/product.dto";
import { ProductRepositoryInterface } from "./interfaces/product.repository.interface";
import { toObjectId } from "../../common/transformers/object.id.transformer";
import { PharmacyRepositoryInterface } from "../pharmacy/interfaces/pharmacy.repository.interface";
import { Product } from "./entities/product.schema";
import { Types } from "mongoose";

@Injectable()
export class ProductService implements ProductServiceInterface {
  constructor(
    @Inject('ProductRepositoryInterface')
    private readonly productRepository: ProductRepositoryInterface,
    @Inject('PharmacyRepositoryInterface')
    private readonly pharmacyRepository: PharmacyRepositoryInterface,
  ) {}

  async handleCreateProduct(
    productDto: ProductDto,
  ): Promise<{ message: string }> {
    const pharmacyObjectId = toObjectId(productDto.pharmacyId);
    const product =
      await this.productRepository.findProductByPharmacyIdAndBarcodeAndName(pharmacyObjectId, productDto.barcode, productDto.name);
    if (!product) {
      throw new BadRequestException('You already have a product with this name or barcode');
    }
    if (productDto.alternatives) {
      productDto.alternatives = JSON.parse(productDto.alternatives);
    }
    const categoryObjectId = toObjectId(productDto.category);
    await this.productRepository.createProduct(productDto, pharmacyObjectId, categoryObjectId);
    return { message: 'Product created' };
  }

  async handleGetPharmacyProducts(user_id: string,): Promise<{ products: Product[] }> {
    const userObjectId = toObjectId(user_id);
    const userPharmacies = await this.pharmacyRepository.getPharmacistPharmaciesWithoutPagination(userObjectId,);
    const pharmaciesIds = userPharmacies.map((pharmacy) => pharmacy._id);
    const products =await this.productRepository.getProductsByPharmaciesIds(pharmaciesIds);
    return { products: products };
  }

  async handleUpdateProduct(productDto: ProductDto, product_id: string): Promise<{ message: string; product: Product }> {
      const pharmacyObjectId = toObjectId(productDto.pharmacyId);
      const categoryObjectId = toObjectId(productDto.category);
      const productObjectId = toObjectId(product_id);
      const product = await this.productRepository.getProductsByIdAndPharmacyId(productObjectId, pharmacyObjectId);
      if (!product) {
        throw new BadRequestException('This product doesn\'t exist');
      }
      const productData: any = {
        ...productDto,
        category: categoryObjectId,
        pharmacyId: pharmacyObjectId
      }
      if (productDto.alternatives) {
        productData.alternatives = JSON.parse(productDto.alternatives) as string[];
      }
      if (productDto.stock !== product.stock) {
        productData.lastStockUpdate = new Date();
      }
      productData.requiresPrescription = productDto.requiresPrescription === "true";
      const updatedProduct = await this.productRepository.updateProduct(productData, productObjectId)
      return { message: 'Product updated successfully', product: updatedProduct }
  }
}
