from rest_framework import serializers

from .models import (
    OrderModel,
    OrderItemModel,
)
from decimal import Decimal
from product.models import ProductModel
from django.db import transaction
from decouple import config

class OrderItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="product.product_name",
        read_only=True,
    )

    product_price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    product_color_name = serializers.CharField(
        source="color.product_color_name", read_only=True
    )
    product_image = serializers.SerializerMethodField()

    product_size_name = serializers.CharField(
        source="size.product_size_name", read_only=True
    )

    class Meta:
        model = OrderItemModel
        fields = [
            "id",
            "product",
            "product_name",
            "product_price",
            "color",
            "product_image",
            "product_color_name",
            "size",
            "product_size_name",
            "quantity",
            "subtotal",
        ]
        
    def get_product_image(self, obj):
        image = obj.product.images.filter(is_primary=True).first()
    
        if image and image.image:
            new_image = f"{config('BACKEND_URL').rstrip('/')}/{image.image.url.lstrip('/')}"
            return new_image
    
        return None



class OrderSerializer(serializers.ModelSerializer):

    items = serializers.ListField(
        write_only=True,
        required=False,
    )
    
    country_country_name=serializers.CharField(source="country.name",read_only=True)
    state_state_name=serializers.CharField(source="state.name",read_only=True)
    city_city_name=serializers.CharField(source="city.name",read_only=True)
    user_username=serializers.CharField(source="user.username",read_only=True)
    class Meta:
        model = OrderModel
        fields = [
            "id",
            "user",
            "user_username",
            "order_number",
            "status",
            "subtotal",
            "shipping_cost",
            "tax_amount",
            "total_amount",
            "items",
            "address",
            "country",
            "country_country_name",
            "state",
            "state_state_name",
            "city",
            "city_city_name",
            "payment_status",
            "payment_id",
            "transaction_id",
            "paid_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):

        items = attrs.get("items", [])

        if self.instance is None and not items:
            raise serializers.ValidationError("At least one item is required.")

        for item in items:
            product = item.get("product")
            quantity = item.get("quantity")

            if not product:
                raise serializers.ValidationError("product is required.")

            if not quantity:
                raise serializers.ValidationError("quantity is required.")

            if quantity < 1:
                raise serializers.ValidationError("quantity must be greater than zero.")

            if not ProductModel.objects.filter(id=product).exists():
                raise serializers.ValidationError(f"Product {product} does not exist.")

        return attrs

    @transaction.atomic()
    def create(self, validated_data):
        items = validated_data.pop("items", [])

        order = OrderModel.objects.create(**validated_data)

        order_subtotal = 0

        for item in items:
            product = ProductModel.objects.get(id=item["product"])

            order_item_subtotal = product.price * item["quantity"]

            order_subtotal += order_item_subtotal

            OrderItemModel.objects.create(
                order=order,
                product=product,
                quantity=item["quantity"],
                subtotal=order_item_subtotal,
            )

        shipping_cost = order_subtotal * Decimal("0.08")

        total_amount = float((order_subtotal + shipping_cost))

        order.subtotal = order_subtotal
        order.shipping_cost = shipping_cost
        order.tax_amount = 0
        order.total_amount = total_amount

        order.save()

        return order

    def update(self, instance, validated_data):
        items = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items is not None:

            processed_item_ids = []

            for item in items:

                product = ProductModel.objects.get(id=item["product"])

                subtotal = product.price * item["quantity"]

                if item.get("id"):

                    order_item = OrderItemModel.objects.get(
                        id=item["id"],
                        order=instance,
                    )

                    order_item.product = product
                    order_item.quantity = item["quantity"]
                    order_item.subtotal = subtotal
                    order_item.save()

                    processed_item_ids.append(order_item.id)

                else:

                    order_item = OrderItemModel.objects.create(
                        order=instance,
                        product=product,
                        quantity=item["quantity"],
                        subtotal=subtotal,
                    )

                    processed_item_ids.append(order_item.id)

            OrderItemModel.objects.filter(order=instance).exclude(
                id__in=processed_item_ids
            ).delete()

        order_subtotal = sum(item.subtotal for item in instance.items.all())

        shipping_cost = order_subtotal * Decimal("0.08")

        total_amount = order_subtotal + shipping_cost

        instance.subtotal = order_subtotal
        instance.shipping_cost = shipping_cost
        instance.tax_amount = 0
        instance.total_amount = total_amount

        instance.save()

        return instance

    def to_representation(self, instance):

        data = super().to_representation(instance)

        data["items"] = OrderItemSerializer(
            instance.items.all(),
            many=True,
        ).data

        return data
