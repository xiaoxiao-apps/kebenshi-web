#!/usr/bin/env python3
"""keben_web 本地预览服务：8931 端口，全响应 no-store，根治浏览器吃旧页。
重起：kill 旧 pid 后 cd ~/projects/keben_web && nohup python3 tools/preview_nocache.py >/tmp/keben_8931_nocache.log 2>&1 &
（2026-09-26 从 /tmp 迁入仓库持久化：/tmp 被系统清理曾导致服务失踪）"""
import functools
import http.server
import socketserver

ROOT = '/Users/personal/projects/keben_web'


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    handler = functools.partial(NoCacheHandler, directory=ROOT)
    with Server(('0.0.0.0', 8931), handler) as httpd:
        httpd.serve_forever()
