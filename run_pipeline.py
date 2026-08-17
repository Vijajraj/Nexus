import sys
import subprocess

def run_script(script_name):
    print(f"=== Running {script_name} ===")
    result = subprocess.run([sys.executable, script_name], capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(f"Error running {script_name}:")
        print(result.stderr)
        sys.exit(result.returncode)

def main():
    run_script("src/generate_data.py")
    run_script("src/feature_engineering.py")
    run_script("src/train_model.py")
    run_script("src/generate_dossier.py")
    print("=== Nexus Data & ML Pipeline Completed Successfully ===")

if __name__ == "__main__":
    main()
