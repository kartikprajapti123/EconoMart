from django.shortcuts import render

# Create your views here.
from django.db import transaction
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated,AllowAny
import json
from product.models import (
    ProductModel,
    ProductSizeModel,
    ProductBrandModel,
    ProductColorModel,
)
from product.serializer import (
    ProductSerializer,
    ProductBrandSerializer,
    ProductColorSerializer,
    ProductSizeSerializer,
)
from utils.myPagination import MyPagination


class ProductViewSet(ModelViewSet):
    queryset = (
        ProductModel.objects.select_related("product_brand")
        .prefetch_related(
            "product_colors",
            "product_sizes",
            "images",
        )
        .order_by("-id")
    )

    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = [
        "product_name",
        "product_brand__product_brand_name",
    ]

    ordering_fields = [
        "id",
        "product_name",
        "price",
        "stock",
        "created_at",
    ]

    pagination_class = MyPagination

    def list(self, request, *args, **kwargs):
        user=request.user
            
        queryset = self.filter_queryset(self.get_queryset())
        if user.is_authenticated:
            if user.user_type=="Seller":
                queryset=queryset.filter(user=user)
        
        brand_id = request.query_params.get("brand_id")
        if brand_id:
            queryset = queryset.filter(product_brand_id=brand_id)

        productStatus = request.query_params.get("productStatus")
        if productStatus:
            productStatus = productStatus.lower() == "true"
            queryset = queryset.filter(is_active=productStatus)

        stockStatus = request.query_params.get("stockStatus")
        if stockStatus:
            if stockStatus == "in_stock":
                queryset = queryset.filter(stock__gt=0)

            elif stockStatus == "out_of_stock":
                queryset = queryset.filter(stock__lte=0)

        customOrdering = request.query_params.get("customOrdering")
        if customOrdering:
            queryset = queryset.order_by(customOrdering)

        no_pagination = request.query_params.get("no_pagination")
        if no_pagination:
            serializer = self.serializer_class(
                queryset,
                many=True,
            )
            return Response(
                {
                    "success": True,
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.serializer_class(
                page,
                many=True,
            )

            return self.get_paginated_response(serializer.data)
        serializer = self.serializer_class(
            queryset,
            many=True,
        )
        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @transaction.atomic()
    def create(self, request, *args, **kwargs):
        print(request.FILES.getlist("product_images"))
        data = json.loads(request.data.get("form_data", "{}"))
        data["product_images"] = request.FILES.getlist("product_images")
        print(data)
        data["user"]=request.user.id
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    
                    
                    "message": "Product created successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        first_field = list(serializer.errors.keys())[0]
        print(serializer.errors)
        return Response(
            {
                "success": False,
                "error": serializer.errors[first_field][0],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    @transaction.atomic()
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = json.loads(request.data.get("form_data", "{}"))
        data["new_images"] = request.FILES.getlist("new_images")
        serializer = self.serializer_class(
            instance,
            data=data,
            partial=True,
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Product updated successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        first_field = list(serializer.errors.keys())[0]
        return Response(
            {
                "success": False,
                "error": serializer.errors[first_field][0],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.serializer_class(instance)
        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        product_id = instance.id
        instance.delete()
        return Response(
            {
                "success": True,
                "message": "Product deleted successfully",
                "id": product_id,
            },
            status=status.HTTP_200_OK,
        )


class ProductBrandViewSet(ModelViewSet):
    queryset = ProductBrandModel.objects.order_by("-id")
    serializer_class = ProductBrandSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        "product_brand_name",
    ]
    ordering_fields = [
        "id",
        "product_brand_name",
        "created_at",
    ]
    pagination_class = MyPagination

    def list(self, request, *args, **kwargs):
        user=request.user
        queryset = self.filter_queryset(self.get_queryset())

        if user.user_type=="Seller":
            queryset=queryset.filter(user=user)
        no_pagination = request.query_params.get("no_pagination")
        if no_pagination:
            serializer = self.serializer_class(
                queryset,
                many=True,
            )
            return Response(
                {
                    "success": True,
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.serializer_class(
                page,
                many=True,
            )

            return self.get_paginated_response(serializer.data)
        serializer = self.serializer_class(
            queryset,
            many=True,
        )
        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.serializer_class(instance=instance)
        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def create(self, request, *args, **kwargs):
        
        data = json.loads(request.data.get("form_data"))
        data["user"]=request.user.id
        data["product_brand_logo"] = request.FILES.get("product_brand_logo")
        print(data["product_brand_logo"])
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Product brand created successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        first_field = list(serializer.errors.keys())[0]
        return Response(
            {
                "success": False,
                "error": serializer.errors[first_field][0],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def update(self, request, *args, **kwargs):
        data = json.loads(request.data.get("form_data"))
        data["product_brand_logo"] = request.FILES.get("product_brand_logo")
        print(data["product_brand_logo"])
        serializer = self.serializer_class(
            self.get_object(),
            data=data,
            partial=True,
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Product brand updated successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        first_field = list(serializer.errors.keys())[0]
        return Response(
            {
                "success": False,
                "error": serializer.errors[first_field][0],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        deleted_id = instance.id
        instance.delete()
        return Response(
            {
                "success": True,
                "message": "Product brand deleted successfully",
                "id": deleted_id,
            },
            status=status.HTTP_200_OK,
        )


class ProductSizeViewSet(ModelViewSet):
    queryset = ProductSizeModel.objects.order_by("-id")
    serializer_class = ProductSizeSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        "product_size_name",
    ]
    ordering_fields = ["product_size_name", "created_at"]
    pagination_class = MyPagination

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        no_pagination = request.query_params.get("no_pagination")
        if no_pagination:
            serializer = self.serializer_class(
                queryset,
                many=True,
            )
            return Response(
                {
                    "success": True,
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.serializer_class(
                page,
                many=True,
            )

            return self.get_paginated_response(serializer.data)
        serializer = self.serializer_class(
            queryset,
            many=True,
        )
        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request, *args, **kwargs):
        serializer = self.serializer_class(self.get_object())
        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Product size created successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        first_field = list(serializer.errors.keys())[0]
        return Response(
            {
                "success": False,
                "error": serializer.errors[first_field][0],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def update(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            self.get_object(),
            data=request.data,
            partial=True,
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Product size updated successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        first_field = list(serializer.errors.keys())[0]
        return Response(
            {
                "success": False,
                "error": serializer.errors[first_field][0],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        deleted_id = instance.id
        instance.delete()
        return Response(
            {
                "success": True,
                "message": "Product size deleted successfully",
                "id": deleted_id,
            },
            status=status.HTTP_200_OK,
        )


class ProductColorViewSet(ModelViewSet):
    queryset = ProductColorModel.objects.order_by("-id")
    serializer_class = ProductColorSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        "product_color_name",
    ]

    ordering_fields = ["product_color_name", "created_at"]
    pagination_class = MyPagination

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        no_pagination = request.query_params.get("no_pagination")
        if no_pagination:
            serializer = self.serializer_class(
                queryset,
                many=True,
            )
            return Response(
                {
                    "success": True,
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.serializer_class(
                page,
                many=True,
            )

            return self.get_paginated_response(serializer.data)
        serializer = self.serializer_class(
            queryset,
            many=True,
        )
        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request, *args, **kwargs):
        serializer = self.serializer_class(self.get_object())
        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Product color created successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        first_field = list(serializer.errors.keys())[0]
        return Response(
            {
                "success": False,
                "error": serializer.errors[first_field][0],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def update(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            self.get_object(),
            data=request.data,
            partial=True,
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Product color updated successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        first_field = list(serializer.errors.keys())[0]
        return Response(
            {
                "success": False,
                "error": serializer.errors[first_field][0],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        deleted_id = instance.id
        instance.delete()

        return Response(
            {
                "success": True,
                "message": "Product color deleted successfully",
                "id": deleted_id,
            },
            status=status.HTTP_200_OK,
        )
