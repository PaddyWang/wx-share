
class ResultCode:
    success = 1000  # 成功请求并返回数据
    third_part_api_error = 4104  # 第三方接口异常
    get_wx_ticket_error = 4144  # 获取微信ticket失败
    get_wx_access_token_error = 4145  # 获取微信access token失败