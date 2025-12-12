from django.utils.deprecation import MiddlewareMixin

class CookieToHeaderAuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        token = request.COOKIES.get("auth_token")
        print("COOKIE TOKEN =", token)
        print("HEADER =", request.META.get("HTTP_AUTHORIZATION"))

        if token and "HTTP_AUTHORIZATION" not in request.META:
            request.META["HTTP_AUTHORIZATION"] = f"Token {token}"
            print("SET HEADER =", request.META["HTTP_AUTHORIZATION"])
        return None