from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from .models import RequestLog, Collection, SavedRequest


class SendRequest(APIView):
    def post(self, request):
        excluded_headers = ["content-encoding", "transfer-encoding", "connection"]

        data = request.data

        try:
            response = requests.request(
                method=data.get("method", "GET"),
                url=data.get("url"),
                headers=data.get("headers", {}),
                json=data.get("body", {}),
            )

            try:
                body = response.json()
            except:
                body = response.text

            headers = {
                k: v
                for k, v in response.headers.items()
                if k.lower() not in excluded_headers
            }

            RequestLog.objects.create(
                url=data.get("url"),
                method=data.get("method", "GET"),
                request_headers=data.get("headers", {}),
                request_body=data.get("body", {}),
                status_code=response.status_code,
                response_headers=headers,
                response_body=body if isinstance(body, dict) else {"raw": body},
            )

            return Response(
                {"status": response.status_code, "headers": headers, "body": body}
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
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


class CollectionList(APIView):
    def get(self, request):
        collections = Collection.objects.all()
        data = [
            {
                "id": c.id,
                "name": c.name,
                "description": c.description,
                "created_at": c.created_at,
                "updated_at": c.updated_at,
                "request_count": c.requests.count(),
            }
            for c in collections
        ]
        return Response(data)

    def post(self, request):
        data = request.data
        collection = Collection.objects.create(
            name=data.get("name"), description=data.get("description", "")
        )
        return Response(
            {
                "id": collection.id,
                "name": collection.name,
                "description": collection.description,
                "created_at": collection.created_at,
                "updated_at": collection.updated_at,
            },
            status=status.HTTP_201_CREATED,
        )


class CollectionDetail(APIView):
    def get(self, request, pk):
        try:
            collection = Collection.objects.get(pk=pk)
            requests_data = [
                {
                    "id": r.id,
                    "name": r.name,
                    "url": r.url,
                    "method": r.method,
                    "created_at": r.created_at,
                    "updated_at": r.updated_at,
                }
                for r in collection.requests.all()
            ]
            return Response(
                {
                    "id": collection.id,
                    "name": collection.name,
                    "description": collection.description,
                    "created_at": collection.created_at,
                    "updated_at": collection.updated_at,
                    "requests": requests_data,
                }
            )
        except Collection.DoesNotExist:
            return Response(
                {"error": "Collection not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request, pk):
        try:
            collection = Collection.objects.get(pk=pk)
            data = request.data
            collection.name = data.get("name", collection.name)
            collection.description = data.get("description", collection.description)
            collection.save()
            return Response(
                {
                    "id": collection.id,
                    "name": collection.name,
                    "description": collection.description,
                    "updated_at": collection.updated_at,
                }
            )
        except Collection.DoesNotExist:
            return Response(
                {"error": "Collection not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk):
        try:
            collection = Collection.objects.get(pk=pk)
            collection.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Collection.DoesNotExist:
            return Response(
                {"error": "Collection not found"}, status=status.HTTP_404_NOT_FOUND
            )


class SavedRequestList(APIView):
    def get(self, request):
        collection_id = request.query_params.get("collection_id")
        if collection_id:
            saved_requests = SavedRequest.objects.filter(collection_id=collection_id)
        else:
            saved_requests = SavedRequest.objects.all()

        data = [
            {
                "id": r.id,
                "collection_id": r.collection_id,
                "name": r.name,
                "url": r.url,
                "method": r.method,
                "headers": r.headers,
                "body": r.body,
                "created_at": r.created_at,
                "updated_at": r.updated_at,
            }
            for r in saved_requests
        ]
        return Response(data)

    def post(self, request):
        data = request.data
        try:
            collection = Collection.objects.get(pk=data.get("collection_id"))
            saved_request = SavedRequest.objects.create(
                collection=collection,
                name=data.get("name"),
                url=data.get("url"),
                method=data.get("method"),
                headers=data.get("headers", {}),
                body=data.get("body"),
            )
            return Response(
                {
                    "id": saved_request.id,
                    "collection_id": saved_request.collection_id,
                    "name": saved_request.name,
                    "url": saved_request.url,
                    "method": saved_request.method,
                    "headers": saved_request.headers,
                    "body": saved_request.body,
                    "created_at": saved_request.created_at,
                },
                status=status.HTTP_201_CREATED,
            )
        except Collection.DoesNotExist:
            return Response(
                {"error": "Collection not found"}, status=status.HTTP_404_NOT_FOUND
            )


class SavedRequestDetail(APIView):
    def get(self, request, pk):
        try:
            saved_request = SavedRequest.objects.get(pk=pk)
            return Response(
                {
                    "id": saved_request.id,
                    "collection_id": saved_request.collection_id,
                    "name": saved_request.name,
                    "url": saved_request.url,
                    "method": saved_request.method,
                    "headers": saved_request.headers,
                    "body": saved_request.body,
                    "created_at": saved_request.created_at,
                    "updated_at": saved_request.updated_at,
                }
            )
        except SavedRequest.DoesNotExist:
            return Response(
                {"error": "Saved request not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request, pk):
        try:
            saved_request = SavedRequest.objects.get(pk=pk)
            data = request.data
            saved_request.name = data.get("name", saved_request.name)
            saved_request.url = data.get("url", saved_request.url)
            saved_request.method = data.get("method", saved_request.method)
            saved_request.headers = data.get("headers", saved_request.headers)
            saved_request.body = data.get("body", saved_request.body)
            saved_request.save()
            return Response(
                {
                    "id": saved_request.id,
                    "name": saved_request.name,
                    "url": saved_request.url,
                    "method": saved_request.method,
                    "updated_at": saved_request.updated_at,
                }
            )
        except SavedRequest.DoesNotExist:
            return Response(
                {"error": "Saved request not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk):
        try:
            saved_request = SavedRequest.objects.get(pk=pk)
            saved_request.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except SavedRequest.DoesNotExist:
            return Response(
                {"error": "Saved request not found"}, status=status.HTTP_404_NOT_FOUND
            )
