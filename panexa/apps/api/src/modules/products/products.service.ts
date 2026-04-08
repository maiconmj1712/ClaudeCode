import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { calculatePrice } from '@panexa/shared-types'
import type { ProductDto } from '@panexa/shared-types'

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: { category?: string; type?: string; isActive?: boolean; visibleTo?: string }) {
    return this.prisma.product.findMany({
      where: {
        isActive: params?.isActive !== undefined ? params.isActive : true,
        ...(params?.category && { category: params.category as any }),
        ...(params?.type     && { type: params.type as any }),
        ...(params?.visibleTo && { isVisibleTo: { in: [params.visibleTo as any, 'AMBOS'] } }),
      },
      include: { discountTiers: { orderBy: { minQuantity: 'asc' } } },
      orderBy: { displayOrder: 'asc' },
    })
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { discountTiers: { orderBy: { minQuantity: 'asc' } } },
    })
    if (!product) throw new NotFoundException('Produto não encontrado')
    return product
  }

  async create(data: any) {
    const { discountTiers, ...productData } = data
    return this.prisma.product.create({
      data: {
        ...productData,
        discountTiers: discountTiers?.length
          ? { create: discountTiers }
          : undefined,
      },
      include: { discountTiers: true },
    })
  }

  async update(id: string, data: any) {
    const { discountTiers, ...productData } = data
    await this.findOne(id)

    return this.prisma.$transaction(async (tx) => {
      if (discountTiers !== undefined) {
        await tx.discountTier.deleteMany({ where: { productId: id } })
        if (discountTiers.length) {
          await tx.discountTier.createMany({
            data: discountTiers.map((t: any) => ({ ...t, productId: id })),
          })
        }
      }
      return tx.product.update({
        where: { id },
        data: productData,
        include: { discountTiers: { orderBy: { minQuantity: 'asc' } } },
      })
    })
  }

  async calculatePrice(productId: string, quantity: number) {
    const product = await this.findOne(productId)
    return calculatePrice(product as any, quantity)
  }

  async findByClinicSlug(slug: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isEnabled: true },
          include: {
            product: {
              include: { discountTiers: { orderBy: { minQuantity: 'asc' } } },
            },
          },
        },
      },
    })
    if (!clinic) throw new NotFoundException('Clínica não encontrada')

    // Return enabled products with possible custom price
    return clinic.products.map(cp => ({
      ...cp.product,
      pricePerUnit: cp.customPrice ?? cp.product.pricePerUnit,
    }))
  }

  async remove(id: string) {
    await this.findOne(id)
    // Soft delete — deactivate instead of hard delete to preserve order history
    return this.prisma.product.update({ where: { id }, data: { isActive: false } })
  }
}
