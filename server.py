import http.server
import socketserver
import os

PORT = 5000
HOST = "0.0.0.0"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=".", **kwargs)

    def do_GET(self):
        if self.path == "/" or self.path == "":
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            html = self.generate_index()
            self.wfile.write(html.encode())
        else:
            super().do_GET()

    def generate_index(self):
        skills = sorted([d for d in os.listdir(".local/skills") if os.path.isdir(f".local/skills/{d}")])
        secondary = sorted([d for d in os.listdir(".local/secondary_skills") if os.path.isdir(f".local/secondary_skills/{d}")])

        skill_items = ""
        for s in skills:
            skill_items += f'<li><span class="badge">core</span> {s}</li>\n'

        secondary_items = ""
        for s in secondary:
            secondary_items += f'<li><span class="badge secondary">domain</span> {s}</li>\n'

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Replit Agent Skills Library</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0e1117;
            color: #e6edf3;
            min-height: 100vh;
            padding: 40px 20px;
        }}
        .container {{ max-width: 900px; margin: 0 auto; }}
        h1 {{
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #f97316, #fb923c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .subtitle {{
            color: #8b949e;
            margin-bottom: 40px;
            font-size: 1rem;
        }}
        .grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }}
        .card {{
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 12px;
            padding: 24px;
        }}
        .card h2 {{
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 4px;
            color: #f0f6fc;
        }}
        .card .count {{
            color: #8b949e;
            font-size: 0.85rem;
            margin-bottom: 16px;
        }}
        ul {{ list-style: none; }}
        li {{
            padding: 6px 0;
            border-bottom: 1px solid #21262d;
            font-size: 0.9rem;
            color: #c9d1d9;
            display: flex;
            align-items: center;
            gap: 8px;
        }}
        li:last-child {{ border-bottom: none; }}
        .badge {{
            background: #1f6feb;
            color: #fff;
            font-size: 0.7rem;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            flex-shrink: 0;
        }}
        .badge.secondary {{
            background: #388bfd22;
            color: #79c0ff;
            border: 1px solid #388bfd;
        }}
        @media (max-width: 600px) {{
            .grid {{ grid-template-columns: 1fr; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Replit Agent Skills Library</h1>
        <p class="subtitle">A collection of modular agent capabilities for the Replit platform</p>
        <div class="grid">
            <div class="card">
                <h2>Core Skills</h2>
                <p class="count">{len(skills)} skills</p>
                <ul>{skill_items}</ul>
            </div>
            <div class="card">
                <h2>Domain Skills</h2>
                <p class="count">{len(secondary)} skills</p>
                <ul>{secondary_items}</ul>
            </div>
        </div>
    </div>
</body>
</html>"""

    def log_message(self, format, *args):
        print(f"[{self.address_string()}] {format % args}")

with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
    print(f"Serving on http://{HOST}:{PORT}")
    httpd.serve_forever()
