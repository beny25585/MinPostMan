from django.db import models


class RequestLog(models.Model):
    method = models.CharField(max_length=10)
    url = models.URLField()

    request_headers = models.JSONField(blank=True, null=True)
    request_body = models.JSONField(null=True, blank=True)

    status_code = models.IntegerField()
    response_headers = models.JSONField(null=True, blank=True)
    response_body = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.method} {self.url}"


class Collection(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.name


class SavedRequest(models.Model):
    collection = models.ForeignKey(
        Collection, on_delete=models.CASCADE, related_name="requests"
    )
    name = models.CharField(max_length=100)
    url = models.URLField()
    method = models.CharField(max_length=10)
    headers = models.JSONField(blank=True, null=True)
    body = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.name} ({self.method} {self.url})"
