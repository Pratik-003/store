from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from drf_spectacular.utils import extend_schema


from .models import Address
from .serializers import AddressSerializer

class AddressListView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(operation_id="AddressList")
    
    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]
    @extend_schema(operation_id="AddressDetailView")
    
    def get_object(self, pk, user):
        return get_object_or_404(Address, id=pk, user=user)
    
    def get(self, request, pk):
        address = self.get_object(pk, request.user)
        serializer = AddressSerializer(address)
        return Response(serializer.data)
    
    def put(self, request, pk):
        address = self.get_object(pk, request.user)
        serializer = AddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        address = self.get_object(pk, request.user)
        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)