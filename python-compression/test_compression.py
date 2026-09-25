"""
Unit tests for Python Compression & Checksum verification
"""

import unittest
import gzip
import hashlib
import json
import io
import os
import sys

# Test logic
class TestCompression(unittest.TestCase):
    def test_compression_cycle(self):
        sample_data = b"Offline-First Peer-to-Peer File Sharing System " * 500
        compressed = gzip.compress(sample_data, compresslevel=6)
        decompressed = gzip.decompress(compressed)
        self.assertEqual(sample_data, decompressed)
        self.assertLess(len(compressed), len(sample_data))
        ratio = (1 - (len(compressed) / len(sample_data))) * 100
        print(f"Original: {len(sample_data)} bytes -> Compressed: {len(compressed)} bytes (Savings: {ratio:.1f}%)")

    def test_sha256_checksum(self):
        sample_data = b"P2P WebRTC Transfer Payload Chunk"
        sha = hashlib.sha256(sample_data).hexdigest()
        self.assertEqual(len(sha), 64)
        print(f"Checksum test passed: {sha[:16]}...")

if __name__ == '__main__':
    unittest.main()
