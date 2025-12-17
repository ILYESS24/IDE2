"""
Load testing for Aurora AI API using Locust
"""
import os
from locust import HttpUser, task, between
from locust.user.wait_time import constant


class AuroraAIUser(HttpUser):
    """Load testing user for Aurora AI API"""

    # Wait time between requests (in seconds)
    wait_time = between(1, 3)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Test API key (should be set in environment)
        self.api_key = os.getenv("OPENROUTER_API_KEY", "test-key")

    @task(3)  # 30% of requests
    def test_health_check(self):
        """Test health check endpoint"""
        with self.client.get("/health", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Health check failed: {response.status_code}")

    @task(5)  # 50% of requests - most common
    def test_workflow_generation(self):
        """Test workflow generation with AI"""
        payload = {
            "prompt": "Create a simple workflow that processes user requests and responds with AI-generated content"
        }

        with self.client.post("/studio/ai-workflow",
                            json=payload,
                            catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 429:
                response.success()  # Rate limiting is expected
            else:
                response.failure(f"Workflow generation failed: {response.status_code}")

    @task(2)  # 20% of requests
    def test_agent_chat(self):
        """Test agent chat functionality"""
        payload = {
            "prompt": "Hello, how can you help me?",
            "model": "gpt-4o-mini",
            "provider": "openai",
            "temperature": 0.7
        }

        with self.client.post("/agent/chat",
                            json=payload,
                            catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 429:
                response.success()  # Rate limiting is expected
            else:
                response.failure(f"Agent chat failed: {response.status_code}")


class StressTestUser(AuroraAIUser):
    """High-load stress testing user"""

    # Faster requests for stress testing
    wait_time = constant(0.1)

    @task
    def stress_workflow_generation(self):
        """Stress test workflow generation"""
        payloads = [
            {"prompt": "Create a complex multi-agent workflow"},
            {"prompt": "Build an AI-powered customer support system"},
            {"prompt": "Design a document processing pipeline"},
            {"prompt": "Create a research assistant workflow"},
            {"prompt": "Build an automated code review system"}
        ]

        import random
        payload = random.choice(payloads)

        with self.client.post("/studio/ai-workflow",
                            json=payload,
                            catch_response=True) as response:
            if response.status_code in [200, 429]:
                response.success()
            else:
                response.failure(f"Stress test failed: {response.status_code}")


if __name__ == "__main__":
    # For local testing
    import subprocess
    import sys

    print("🚀 Starting load tests...")
    print("📊 Run with: locust -f tests/load_tests.py --host http://localhost:8000")
    print("🌐 Web UI: http://localhost:8089")
    print("⚡ Stress test: locust -f tests/load_tests.py --host http://localhost:8000 --class-picker StressTestUser")

    # Auto-start locust if run directly
    try:
        subprocess.run([
            sys.executable, "-m", "locust",
            "-f", "tests/load_tests.py",
            "--host", "http://localhost:8000",
            "--autostart",
            "--autoquit", "10"  # Auto quit after 10 seconds
        ])
    except KeyboardInterrupt:
        print("\n🛑 Load testing stopped")
