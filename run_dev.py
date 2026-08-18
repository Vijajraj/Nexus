import os
import sys
import subprocess
import threading
import signal

def stream_logs(process, prefix):
    try:
        for line in iter(process.stdout.readline, ''):
            if line:
                print(f"{prefix} {line.rstrip()}")
    except Exception:
        pass

def run_dev():
    project_root = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(project_root, "frontend")
    backend_dir = os.path.join(project_root, "backend")

    # 1. Verify/Install frontend dependencies if node_modules is missing
    node_modules_path = os.path.join(frontend_dir, "node_modules")
    if not os.path.exists(node_modules_path):
        print("[SETUP] Installing frontend node dependencies...")
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        subprocess.run([npm_cmd, "install"], cwd=frontend_dir, check=True)

    print("==================================================")
    print("[*] Starting Nexus Full-Stack Environment")
    print("   - Backend API: http://127.0.0.1:8000")
    print("   - Frontend UI: http://localhost:5173")
    print("   Press Ctrl+C to terminate both servers")
    print("==================================================")

    # 2. Start Backend
    backend_cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    # 3. Start Frontend
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=frontend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    # Threading for log streaming
    t1 = threading.Thread(target=stream_logs, args=(backend_proc, "[BACKEND]"), daemon=True)
    t2 = threading.Thread(target=stream_logs, args=(frontend_proc, "[FRONTEND]"), daemon=True)
    t1.start()
    t2.start()

    def shutdown(sig=None, frame=None):
        print("\n[SHUTDOWN] Stopping frontend and backend servers...")
        try:
            backend_proc.terminate()
        except Exception:
            pass
        try:
            frontend_proc.terminate()
        except Exception:
            pass
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        shutdown()

if __name__ == "__main__":
    run_dev()
