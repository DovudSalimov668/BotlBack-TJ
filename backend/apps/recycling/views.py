from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import serializers
from .models import RecyclingPoint


class RecyclingPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecyclingPoint
        fields = '__all__'


class RecyclingPointListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = RecyclingPointSerializer
    queryset = RecyclingPoint.objects.filter(is_active=True)


class RecyclingPointDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = RecyclingPointSerializer
    queryset = RecyclingPoint.objects.all()


class VerifyRecyclingPointView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, qr_code):
        rp = RecyclingPoint.objects.filter(qr_code=qr_code, is_active=True).first()
        if not rp:
            return Response({'error': 'Recycling point not found or inactive'}, status=404)
        return Response({
            'qr_code': rp.qr_code,
            'name': rp.name,
            'name_tg': rp.name_tg,
            'address': rp.address,
            'region': rp.region,
            'latitude': float(rp.latitude),
            'longitude': float(rp.longitude),
        })


# ── Admin management ──────────────────────────────────────────────────────────

class AdminOutletListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = RecyclingPoint.objects.all().order_by('-is_active', 'name')
        return Response(RecyclingPointSerializer(qs, many=True).data)

    def post(self, request):
        s = RecyclingPointSerializer(data=request.data)
        if s.is_valid():
            s.save()
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class AdminOutletDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        point = RecyclingPoint.objects.filter(pk=pk).first()
        if not point:
            return Response({'error': 'Not found'}, status=404)
        s = RecyclingPointSerializer(point, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, pk):
        point = RecyclingPoint.objects.filter(pk=pk).first()
        if not point:
            return Response({'error': 'Not found'}, status=404)
        point.delete()
        return Response(status=204)
