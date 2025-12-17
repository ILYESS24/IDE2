"""
Monitoring and alerting system for Aurora AI API
"""
import time
import requests
import logging
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class APIMonitor:
    """API monitoring and alerting system"""

    def __init__(self):
        self.api_url = os.getenv("API_URL", "http://localhost:8000")
        self.alert_email = os.getenv("ALERT_EMAIL")
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")

        # Monitoring thresholds
        self.response_time_threshold = float(os.getenv("RESPONSE_TIME_THRESHOLD", "5.0"))  # seconds
        self.error_rate_threshold = float(os.getenv("ERROR_RATE_THRESHOLD", "5.0"))  # percentage
        self.check_interval = int(os.getenv("CHECK_INTERVAL", "60"))  # seconds

        # Monitoring data
        self.metrics_history: List[Dict] = []
        self.max_history_size = 100

    def check_health(self) -> Dict:
        """Check API health and collect metrics"""
        start_time = time.time()

        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            response_time = time.time() - start_time

            health_data = {
                "timestamp": datetime.now().isoformat(),
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "status_code": response.status_code,
                "response_time": round(response_time, 3),
                "api_available": True
            }

            # Parse response if available
            try:
                if response.status_code == 200:
                    data = response.json()
                    health_data.update({
                        "providers": data.get("providers", {}),
                        "version": data.get("version", "unknown")
                    })
            except json.JSONDecodeError:
                health_data["json_parse_error"] = True

        except requests.exceptions.RequestException as e:
            response_time = time.time() - start_time
            health_data = {
                "timestamp": datetime.now().isoformat(),
                "status": "unhealthy",
                "error": str(e),
                "response_time": round(response_time, 3),
                "api_available": False
            }

        return health_data

    def check_endpoints(self) -> Dict:
        """Test critical endpoints"""
        endpoints = [
            {"name": "health", "url": "/health", "method": "GET"},
            {"name": "workflow", "url": "/studio/ai-workflow", "method": "POST", "data": {"prompt": "test"}},
            {"name": "chat", "url": "/agent/chat", "method": "POST", "data": {"prompt": "hello", "model": "gpt-4o-mini", "provider": "openai", "temperature": 0.7}}
        ]

        results = {}

        for endpoint in endpoints:
            try:
                start_time = time.time()
                if endpoint["method"] == "GET":
                    response = requests.get(f"{self.api_url}{endpoint['url']}", timeout=30)
                else:
                    response = requests.post(f"{self.api_url}{endpoint['url']}",
                                           json=endpoint.get("data", {}), timeout=30)

                response_time = time.time() - start_time

                results[endpoint["name"]] = {
                    "status_code": response.status_code,
                    "response_time": round(response_time, 3),
                    "success": response.status_code in [200, 429]  # 429 is rate limiting, acceptable
                }

            except Exception as e:
                results[endpoint["name"]] = {
                    "error": str(e),
                    "success": False
                }

        return results

    def analyze_metrics(self) -> Dict:
        """Analyze recent metrics for anomalies"""
        if len(self.metrics_history) < 5:
            return {"status": "insufficient_data"}

        recent_metrics = self.metrics_history[-10:]  # Last 10 checks

        # Calculate error rate
        total_checks = len(recent_metrics)
        error_count = sum(1 for m in recent_metrics if m.get("status") != "healthy")
        error_rate = (error_count / total_checks) * 100

        # Calculate average response time
        response_times = [m.get("response_time", 0) for m in recent_metrics if m.get("response_time")]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0

        # Check for anomalies
        issues = []

        if error_rate > self.error_rate_threshold:
            issues.append(f"High error rate: {error_rate:.1f}% (threshold: {self.error_rate_threshold}%)")

        if avg_response_time > self.response_time_threshold:
            issues.append(f"Slow response time: {avg_response_time:.2f}s (threshold: {self.response_time_threshold}s)")

        # Check for consecutive failures
        consecutive_failures = 0
        for metric in reversed(recent_metrics):
            if metric.get("status") != "healthy":
                consecutive_failures += 1
            else:
                break

        if consecutive_failures >= 3:
            issues.append(f"Consecutive failures: {consecutive_failures}")

        return {
            "error_rate": round(error_rate, 2),
            "avg_response_time": round(avg_response_time, 3),
            "issues": issues,
            "status": "critical" if issues else "healthy"
        }

    def send_alert(self, subject: str, message: str):
        """Send alert email"""
        if not self.alert_email or not self.smtp_user:
            logger.warning("Alert email not configured")
            return

        try:
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = self.alert_email
            msg['Subject'] = f"🚨 Aurora AI Alert: {subject}"

            msg.attach(MIMEText(message, 'plain'))

            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            text = msg.as_string()
            server.sendmail(self.smtp_user, self.alert_email, text)
            server.quit()

            logger.info(f"Alert sent: {subject}")

        except Exception as e:
            logger.error(f"Failed to send alert: {e}")

    def store_metrics(self, metrics: Dict):
        """Store metrics in history"""
        self.metrics_history.append(metrics)
        if len(self.metrics_history) > self.max_history_size:
            self.metrics_history.pop(0)

    def run_monitoring_loop(self):
        """Main monitoring loop"""
        logger.info(f"🖥️  Starting API monitoring for {self.api_url}")
        logger.info(f"⏱️  Check interval: {self.check_interval}s")
        logger.info(f"📧 Alert email: {self.alert_email or 'Not configured'}")

        last_alert_time = None
        alert_cooldown = 300  # 5 minutes between alerts

        while True:
            try:
                # Health check
                health_metrics = self.check_health()
                endpoint_metrics = self.check_endpoints()

                # Combine metrics
                full_metrics = {
                    **health_metrics,
                    "endpoints": endpoint_metrics
                }

                self.store_metrics(full_metrics)

                # Analyze and alert
                analysis = self.analyze_metrics()

                status_emoji = "✅" if analysis["status"] == "healthy" else "🚨"
                logger.info(f"{status_emoji} API Status: {analysis['status']} | "
                           f"Error Rate: {analysis['error_rate']}% | "
                           f"Avg Response: {analysis['avg_response_time']}s")

                # Send alerts for critical issues
                if analysis["status"] == "critical":
                    now = datetime.now()
                    if (last_alert_time is None or
                        (now - last_alert_time).seconds > alert_cooldown):

                        alert_message = f"""
Aurora AI API Critical Issues Detected:

{chr(10).join(f"- {issue}" for issue in analysis["issues"])}

Recent Metrics:
- Error Rate: {analysis['error_rate']}%
- Average Response Time: {analysis['avg_response_time']}s
- API URL: {self.api_url}

Please check the API status and resolve issues.
                        """.strip()

                        self.send_alert("API Critical Issues", alert_message)
                        last_alert_time = now

                # Log endpoint status
                for endpoint_name, endpoint_data in endpoint_metrics.items():
                    status = "✅" if endpoint_data.get("success") else "❌"
                    logger.info(f"  {status} {endpoint_name}: {endpoint_data.get('status_code', 'error')} "
                               f"({endpoint_data.get('response_time', 'N/A')}s)")

            except Exception as e:
                logger.error(f"Monitoring error: {e}")

            time.sleep(self.check_interval)

    def get_status_report(self) -> Dict:
        """Get current status report"""
        if not self.metrics_history:
            return {"status": "no_data"}

        latest = self.metrics_history[-1]
        analysis = self.analyze_metrics()

        return {
            "current_status": latest,
            "analysis": analysis,
            "uptime_percentage": self._calculate_uptime(),
            "recent_issues": analysis.get("issues", [])
        }

    def _calculate_uptime(self) -> float:
        """Calculate uptime percentage"""
        if not self.metrics_history:
            return 0.0

        healthy_count = sum(1 for m in self.metrics_history if m.get("status") == "healthy")
        return round((healthy_count / len(self.metrics_history)) * 100, 2)


def main():
    """Main function for running the monitor"""
    monitor = APIMonitor()

    # Print configuration
    print("🚀 Aurora AI API Monitor"    print(f"📡 API URL: {monitor.api_url}")
    print(f"⏱️  Check Interval: {monitor.check_interval}s")
    print(f"📧 Alerts: {'Enabled' if monitor.alert_email else 'Disabled'}")
    print(f"⚡ Response Time Threshold: {monitor.response_time_threshold}s")
    print(f"❌ Error Rate Threshold: {monitor.error_rate_threshold}%")
    print()

    try:
        monitor.run_monitoring_loop()
    except KeyboardInterrupt:
        print("\n🛑 Monitoring stopped")
    except Exception as e:
        logger.error(f"Monitor crashed: {e}")
        raise


if __name__ == "__main__":
    main()
