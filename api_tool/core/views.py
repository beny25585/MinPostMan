from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from .models import RequestLog



# Create your views here.
class SendRequest(APIView):

    def post(self, request):

        excluded_headers = [
            "content-encoding",
            "transfer-encoding",
            "connection"
        ]

        data = request.data

        try:
            # 1. send request
            response = requests.request(
                method=data.get("method", "GET"),
                url=data.get("url"),
                headers=data.get("headers", {}),
                json=data.get("body", {}),
            )

            # 2. body
            try:
                body = response.json()
            except:
                body = response.text

            # 3. headers
            headers = {
                k: v for k, v in response.headers.items()
                if k.lower() not in excluded_headers
            }

            # 4. save to DB
            RequestLog.objects.create(
                url=data.get("url"),
                method=data.get("method", "GET"),
                request_headers=data.get("headers", {}),
                request_body=data.get("body", {}),
                status_code=response.status_code,
                response_headers=headers,
                response_body=body if isinstance(body, dict) else {"raw": body}
            )

            # 5. back to client
            return Response({
                "status": response.status_code,
                "headers": headers,
                "body": body
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        


class RequestHistory(APIView):
    def get(self, request):
        logs = RequestLog.objects.all().order_by("-created_at")[:50]

        data = [
            {
                "id": log.id,
                "url": log.url,
                "method": log.method,
                "status": log.status_code,
                "created_at": log.created_at,
            }
            for log in logs
        ]

        return Response(data)