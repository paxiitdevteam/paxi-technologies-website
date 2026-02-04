#!/usr/bin/env python3
"""
Simple HTTP Server for Paxi Technologies Website
Serves static files with proper MIME types and directory listing support
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

PORT = 3000

# Get the project root directory (where server.py is located) at module load time
PROJECT_ROOT = Path(__file__).parent.absolute()

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler with improved MIME types and error handling"""
    
    def __init__(self, *args, **kwargs):
        # Serve from the directory where server.py is located (project root)
        super().__init__(*args, directory=str(PROJECT_ROOT), **kwargs)
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def guess_type(self, path):
        """Override to provide better MIME type detection"""
        result = super().guess_type(path)
        
        # Handle both tuple and string returns from parent
        if isinstance(result, tuple):
            mimetype, encoding = result
        else:
            mimetype = result
            encoding = None
        
        # Ensure HTML files are served with correct MIME type
        if path.endswith('.html'):
            return ('text/html', encoding) if encoding else 'text/html'
        if path.endswith('.css'):
            return ('text/css', encoding) if encoding else 'text/css'
        if path.endswith('.js'):
            return ('application/javascript', encoding) if encoding else 'application/javascript'
        if path.endswith('.svg'):
            return ('image/svg+xml', encoding) if encoding else 'image/svg+xml'
        
        # Handle SVG files saved with .jpg extension (placeholders)
        if path.endswith(('.jpg', '.jpeg', '.png')) and 'media/images' in path:
            # Check if file is actually SVG by reading first few bytes
            try:
                file_path = os.path.join(PROJECT_ROOT, path.lstrip('/'))
                if os.path.exists(file_path):
                    with open(file_path, 'rb') as f:
                        first_bytes = f.read(100)
                        if b'<svg' in first_bytes or b'<!-- Placeholder SVG' in first_bytes:
                            return ('image/svg+xml', encoding) if encoding else 'image/svg+xml'
            except:
                pass
        
        return result
    
    def log_message(self, format, *args):
        """Custom log format"""
        try:
            sys.stderr.write("%s - - [%s] %s\n" %
                            (self.address_string(),
                             self.log_date_time_string(),
                             format % args))
        except Exception as e:
            # Fallback if logging fails
            print(f"Log error: {e}")
    
    def do_GET(self):
        """Handle GET requests with error handling"""
        try:
            super().do_GET()
        except Exception as e:
            print(f"Error handling request: {e}")
            import traceback
            traceback.print_exc()
            self.send_error(500, f"Internal server error: {str(e)}")

def main():
    """Start the HTTP server"""
    # Ensure we're in the project root directory (where server.py is located)
    script_dir = Path(__file__).parent.absolute()
    os.chdir(script_dir)
    
    # Note: UTF-8 encoding wrapper removed to avoid interfering with HTTP responses
    # The server will handle encoding automatically
    
    print(f"Starting server from directory: {os.getcwd()}")
    print(f"Serving files from: {script_dir}")
    
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print("=" * 60)
            print("Paxi Technologies - Development Server")
            print("=" * 60)
            print(f"Server running at: http://localhost:{PORT}")
            print("Press Ctrl+C to stop the server")
            print("=" * 60)
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n\nServer stopped.")
                sys.exit(0)
    except OSError as e:
        if "10048" in str(e) or "address already in use" in str(e).lower():
            print(f"\nERROR: Port {PORT} is already in use!")
            print("Please stop the existing server or use a different port.")
            sys.exit(1)
        else:
            raise

if __name__ == "__main__":
    main()
