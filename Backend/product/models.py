from django.db import models
from user.models import UserModel
class ProductBrandModel(models.Model):
    product_brand_name = models.CharField(max_length=100,blank=True,null=True)
    product_brand_logo = models.ImageField(upload_to="brands/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    user=models.ForeignKey(UserModel,on_delete=models.PROTECT,related_name="user_brands",null=True,blank=True)
    class Meta:
        ordering = ["product_brand_name"]

    def __str__(self):
        return self.product_brand_name
    
    def delete(self, *args, **kwargs):
        if self.product_brand_logo:
            self.product_brand_logo.delete(save=False)

        super().delete(*args, **kwargs)


class ProductColorModel(models.Model):
    product_color_name = models.CharField(max_length=50,null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["product_color_name"]

    def __str__(self):
        return self.product_color_name


class ProductSizeModel(models.Model):
    product_size_name = models.CharField(max_length=20,null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["product_size_name"]

    def __str__(self):
        return self.product_size_name


class ProductModel(models.Model):
    GENDER_CHOICES = [
        ("men", "Men"),
        ("women", "Women"),
        ("unisex", "Unisex"),
        ("kids", "Kids"),
        ("all", "All"),   
    ]
    product_brand = models.ForeignKey(
        ProductBrandModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    product_colors = models.ManyToManyField(
        ProductColorModel, blank=True, related_name="products"
    )
    product_sizes = models.ManyToManyField(
        ProductSizeModel, blank=True, related_name="products"
    )
    user = models.ForeignKey(
        UserModel,on_delete=models.PROTECT,blank=True, related_name="product_user",null=True
    )
    product_name = models.CharField(max_length=255,null=True,blank=True)
    product_slug = models.SlugField(unique=True,null=True,blank=True)
    product_description = models.TextField(null=True,blank=True)
    product_material_description = models.TextField(null=True,blank=True)
    care_instruction = models.TextField(null=True,blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default="unisex",null=True,blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2,null=True,blank=True)
    stock = models.PositiveIntegerField(default=0,null=True,blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.product_name

class ProductImageModel(models.Model):
    product = models.ForeignKey(
        ProductModel, on_delete=models.CASCADE, related_name="images")

    image = models.ImageField(upload_to="products/")
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def delete(self, *args, **kwargs):
        if self.image:
            self.image.delete(save=False)

        super().delete(*args, **kwargs)

    def __str__(self):
        return self.product.product_name
