from django.db import models


# Create your models here.
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
