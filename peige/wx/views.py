import json

from django.http import HttpResponse

from wx.service import Service
from wx.code import ResultCode

def json_message(success=None, code=None, data=None):
    return {
        'success': success,
        'code': code,
        'data': data
    }

def wx_sign(request):
    """
    获取wx sign
    """
    url = request.GET.get('url', None)
    if not url:
        return HttpResponse(json.dumps(json_message(success=False, code='no parameters')))
    code, ticket = Service().get_ticket()
    if code is not ResultCode.success:
        return HttpResponse(json.dumps(json_message(success=False, code=code)))
    res = Service().get_sign(ticket, url)
    return HttpResponse(json.dumps(json_message(data=res)), content_type="application/json")

