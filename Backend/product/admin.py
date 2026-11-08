from django.contrib import admin

# Register your models here.
from product.models import ProductBrandModel,ProductColorModel,ProductImageModel,ProductModel,ProductSizeModel

admin.site.register(ProductBrandModel)
admin.site.register(ProductSizeModel)
admin.site.register(ProductColorModel)
admin.site.register(ProductModel)
admin.site.register(ProductImageModel)
