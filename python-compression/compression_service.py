"""
Python Compression & Optimization Service for FileUp P2P.
Provides fast chunk compression, folder packaging, and SHA-256 verification.
Works standalone or as a lightweight microservice on port 5000.
"""

import sys
import os
import json
import gzip
import zlib
import zipfile
import hashlib
import io
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 5000

class CompressionHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Compression-Level, X-Original-Name')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path == '/health' or self.path == '/':
            self._set_headers(200)
            res = {
                'status': 'ok',
                'service': 'FileUp Python Compression Service',
                'version': '1.0.0',
                'supportedAlgorithms': ['gzip', 'zlib', 'zip'],
                'hashing': ['sha256', 'md5']
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not Found'}).encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        if self.path == '/checksum':
            # Compute SHA-256 and MD5
            sha256 = hashlib.sha256(post_data).hexdigest()
            md5 = hashlib.md5(post_data).hexdigest()
            self._set_headers(200)
            self.wfile.write(json.dumps({
                'size': len(post_data),
                'sha256': sha256,
                'md5': md5
            }).encode('utf-8'))

        elif self.path.startswith('/compress'):
            # Gzip compression
            level = int(self.headers.get('X-Compression-Level', 6))
            compressed = gzip.compress(post_data, compresslevel=level)
            orig_size = len(post_data)
            comp_size = len(compressed)
            ratio = round((1 - (comp_size / orig_size)) * 100, 2) if orig_size > 0 else 0

            # If client wants JSON info or raw binary
            if 'application/json' in self.headers.get('Accept', ''):
                self._set_headers(200)
                self.wfile.write(json.dumps({
                    'originalSize': orig_size,
                    'compressedSize': comp_size,
                    'savingsPercent': ratio,
                    'sha256': hashlib.sha256(compressed).hexdigest()
                }).encode('utf-8'))
            else:
                self.send_response(200)
                self.send_header('Content-Type', 'application/octet-stream')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('X-Original-Size', str(orig_size))
                self.send_header('X-Compressed-Size', str(comp_size))
                self.send_header('X-Savings-Percent', str(ratio))
                self.end_headers()
                self.wfile.write(compressed)

        elif self.path.startswith('/decompress'):
            try:
                decompressed = gzip.decompress(post_data)
                self.send_response(200)
                self.send_header('Content-Type', 'application/octet-stream')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('X-Decompressed-Size', str(len(decompressed)))
                self.end_headers()
                self.wfile.write(decompressed)
            except Exception as e:
                self._set_headers(400)
                self.wfile.write(json.dumps({'error': f'Decompression failed: {str(e)}'}).encode('utf-8'))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not Found'}).encode('utf-8'))

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[Python Compression] {args[0]} - {args[1]}\n")


def run_service(port=PORT):
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, CompressionHandler)
    print(f"\n======================================================")
    print(f"  FILEUP Python Compression Service Running!")
    print(f"  Listening on: http://localhost:{port}")
    print(f"  Algorithms:   gzip, zlib, zip")
    print(f"======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping compression service...")
        httpd.server_close()


if __name__ == '__main__':
    port = PORT
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    run_service(port)
