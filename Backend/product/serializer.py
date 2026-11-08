from rest_framework import serializers

from .models import (
    ProductBrandModel,
    ProductColorModel,
    ProductSizeModel,
    ProductModel,
    ProductImageModel,
)
from decouple import config


class ProductBrandSerializer(serializers.ModelSerializer):

    product_brand_logo = serializers.ImageField(required=False, allow_null=True)
    username=serializers.CharField(source="user.username",required=False)
    class Meta:
        model = ProductBrandModel
        fields = [
            "id",
            "product_brand_name",
            "product_brand_logo",
            "user",
            "username",
            "created_at",
        ]

    def validate(self, attrs):
        product_brand_name = attrs.get("product_brand_name")
        product_brand_logo = attrs.get("product_brand_logo")

        if product_brand_logo:
            max_size = 2 * 1024 * 1024
            if product_brand_logo.size > max_size:
                raise serializers.ValidationError(
                    "Product Brand Logo size cannot exceed 2 MB"
                )
        if not product_brand_name:
            raise serializers.ValidationError("Product brand name is required")

        product_brand_instance = ProductBrandModel.objects.filter(
            product_brand_name=product_brand_name
        )

        if self.instance:
            product_brand_instance = product_brand_instance.exclude(id=self.instance.id)

        if product_brand_instance.exists():
            raise serializers.ValidationError("Product brand already exists")

        return attrs

    def update(self, instance, validated_data):
        if validated_data.get("product_brand_logo") and instance.product_brand_logo:
            instance.product_brand_logo.delete(save=False)

        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.product_brand_logo:
            data["product_brand_logo"] = (
                f"{config('BACKEND_URL')}media/{instance.product_brand_logo}"
            )

        return data


class ProductColorSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductColorModel
        fields = ["id", "product_color_name", "created_at"]

    def validate(self, attrs):
        product_color_name = attrs.get("product_color_name")

        if not product_color_name:
            raise serializers.ValidationError("Product color name is required")

        product_color_instance = ProductColorModel.objects.filter(
            product_color_name=product_color_name
        )

        if self.instance:
            product_color_instance = product_color_instance.exclude(id=self.instance.id)

        if product_color_instance.exists():
            raise serializers.ValidationError("Product color already exists")

        return attrs


class ProductSizeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductSizeModel
        fields = [
            "id",
            "product_size_name",
            "created_at",
        ]

    def validate(self, attrs):
        product_size_name = attrs.get("product_size_name")

        if not product_size_name:
            raise serializers.ValidationError("Product size name is required")

        product_size_name = product_size_name.strip()

        product_size_instance = ProductSizeModel.objects.filter(
            product_size_name__iexact=product_size_name
        )

        if self.instance:
            product_size_instance = product_size_instance.exclude(id=self.instance.id)

        if product_size_instance.exists():
            raise serializers.ValidationError("Product size already exists")

        attrs["product_size_name"] = product_size_name.upper()

        return attrs


class ProductImageSerializer(serializers.ModelSerializer):

    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = ProductImageModel
        fields = [
            "id",
            "product",
            "image",
            "is_primary",
            "created_at",
        ]

    def get_image(self, obj):
        new_image = f"{config('BACKEND_URL')}media/{obj.image}"
        return new_image

    def validate(self, attrs):
        product = attrs.get("product")
        is_primary = attrs.get("is_primary")
        image = attrs.get("image")

        if image:
            max_size = 2 * 1024 * 1024
            if image.size > max_size:
                raise serializers.ValidationError(
                    {"Product Image size cannot exceed 2 MB"}
                )

        if is_primary and product:
            image_instance = ProductImageModel.objects.filter(
                product=product,
                is_primary=True,
            )
            if self.instance:
                image_instance = image_instance.exclude(id=self.instance.id)

            if image_instance.exists():
                raise serializers.ValidationError(
                    "Only one primary image is allowed per product"
                )

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.image:
            data["image"] = f"{config('BACKEND_URL')}media/{instance.image}"

        return data


class ProductSerializer(serializers.ModelSerializer):
    product_colors = serializers.ListField(write_only=True, required=False)
    product_sizes = serializers.ListField(write_only=True, required=False)
    product_images = serializers.ListField(write_only=True, required=False)
    new_images = serializers.ListField(write_only=True, required=False)

    product_brand_name = serializers.CharField(
        source="product_brand.product_brand_name", required=False
    )
    user_username=serializers.CharField(source="user.username",read_only=True,required=False)

    class Meta:
        model = ProductModel
        fields = [
            "id",
            "product_brand",
            "product_brand_name",
            "product_colors",
            "product_sizes",
            "product_name",
            "user",
            "user_username",
            "product_slug",
            "product_description",
            "product_material_description",
            "care_instruction",
            "gender",
            "price",
            "stock",
            "is_active",
            "product_images",
            "created_at",
            "updated_at",
            "new_images",
        ]

    def validate(self, attrs):
        product_name = attrs.get("product_name")

        if not product_name:
            raise serializers.ValidationError("Product name is required")

        product_instance = ProductModel.objects.filter(product_name=product_name)

        if self.instance:
            product_instance = product_instance.exclude(id=self.instance.id)

        if product_instance.exists():
            raise serializers.ValidationError("Product name already exists")

        return attrs

    def create(self, validated_data):
        color_ids = validated_data.pop("product_colors", [])
        size_ids = validated_data.pop("product_sizes", [])
        product_images = validated_data.pop("product_images", [])

        product = ProductModel.objects.create(**validated_data)

        if color_ids:
            product.product_colors.set(
                ProductColorModel.objects.filter(id__in=color_ids)
            )

        if size_ids:
            product.product_sizes.set(ProductSizeModel.objects.filter(id__in=size_ids))

        for index, image in enumerate(product_images):
            ProductImageModel.objects.create(
                product=product,
                image=image,
                is_primary=index == 0,
            )

        return product

    def update(self, instance, validated_data):
        color_ids = validated_data.pop("product_colors", None)
        size_ids = validated_data.pop("product_sizes", None)
        product_images = validated_data.pop("product_images", None)
        new_images = validated_data.pop("new_images", [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if color_ids is not None:
            instance.product_colors.set(
                ProductColorModel.objects.filter(id__in=color_ids)
            )

        if size_ids is not None:
            instance.product_sizes.set(ProductSizeModel.objects.filter(id__in=size_ids))

        if product_images is not None:
            ProductImageModel.objects.filter(product=instance).exclude(
                id__in=product_images
            ).delete()

        for image in new_images:
            ProductImageModel.objects.create(
                product=instance,
                image=image,
                is_primary=False,
            )
        instance.refresh_from_db()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["product_sizes"] = ProductSizeSerializer(
            instance.product_sizes.all(),
            many=True,
        ).data

        data["product_colors"] = ProductColorSerializer(
            instance.product_colors.all(),
            many=True,
        ).data

        data["product_images"] = ProductImageSerializer(
            instance.images.all(),
            many=True,
        ).data

        return data
