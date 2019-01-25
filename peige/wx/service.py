import datetime
import requests
from django.conf import settings
import random
import string
import time
import hashlib
from wx.code import ResultCode

from rest_framework import views

class Service:

    def get_ticket(self):
        return self.get_ticket_from_wx()

    def get_access_token(self):
        wx_app_id = settings.WX_APPID
        wx_secret = settings.WX_SECRET
        code, access_token = self.get_access_token_from_wx(wx_app_id, wx_secret)
        return code, access_token

    def get_ticket_from_wx(self):
        code, access_token = self.get_access_token()
        if code != ResultCode.success:
            return code, ''
        get_ticket_url = u"https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=%s&type=jsapi" % (
            access_token,)
        r = requests.get(get_ticket_url)
        if r.status_code != 200:
            return ResultCode.third_part_api_error, ''
        r_json = r.json()
        ticket = r_json.get('ticket', None)
        if ticket:
            return ResultCode.success, ticket
        return ResultCode.get_wx_ticket_error, ''

    def get_access_token_from_wx(self, wx_app_id, wx_secret):
        url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s' % \
              (wx_app_id, wx_secret)
        r = requests.get(url)
        if r.status_code != 200:
            return ResultCode.third_part_api_error, ''
        r_json = r.json()
        access_token = r_json.get('access_token', None)
        if access_token:
            return ResultCode.success, access_token
        return ResultCode.get_wx_access_token_error, ''

    def get_sign(self, ticket, url):
        wx_app_id = settings.WX_APPID
        noncestr = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(15))
        timestamp = int(time.time())
        res = {'noncestr': noncestr, 'jsapi_ticket': ticket, 'timestamp': timestamp, 'url': url}
        sign_url = '&'.join(['%s=%s' % (key.lower(), res.get(key, '')) for key in sorted(res)])
        sha1 = hashlib.sha1()
        sha1.update(sign_url.encode('utf-8'))
        res['signature'] = sha1.hexdigest()
        # res['signature'] = hashlib.sha1(sign_url).hexdigest()
        res['wx_appid'] = wx_app_id
        res.pop('jsapi_ticket')
        return res